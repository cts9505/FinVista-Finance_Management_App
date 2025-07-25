import cron from 'node-cron';
import userModel from '../models/model.js';
import BillModel from '../models/BillModel.js';
import BudgetModel from '../models/BudgetModel.js';
import transporter from '../config/mailer.js';
import { PAYMENT_EXPIRY_TEMPLATE,BILL_REMINDER_TEMPLATE,
    YEAR_END_BUDGET_SUMMARY_TEMPLATE,
    MONTHLY_BUDGET_SUMMARY_TEMPLATE,
    BUDGET_10_PERCENT_TEMPLATE,
    BUDGET_EXHAUSTED_TEMPLATE,
} from '../config/emailTemplates.js';


const checkExpiringPayments = cron.schedule('0 0 * * *', async () => {
    try {

        const today = new Date();
        const threeDaysLater = new Date();
        threeDaysLater.setDate(today.getDate() + 3);

        // Find payments expiring in the next 3 days
        const expiringPayments = await userModel.find({
            subscriptionEndDate: { $gte: today, $lte: threeDaysLater }
        });

        for (const user of expiringPayments) {
            try {
                const formattedDate = user.subscriptionEndDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });

                const mailOptions = {
                    from: process.env.SENDER_EMAIL,
                    to: user.email,
                    subject: "Your Subscription is Expiring Soon",
                    html: PAYMENT_EXPIRY_TEMPLATE.replace('{{name}}', user.name).replace('{{subscriptionType}}', user.subscriptionType).replace('{{subscriptionEndDate}}', formattedDate),
                }
                await transporter.sendMail(mailOptions);
            } catch (emailError) {
                console.error(`Failed to send email to ${user.email}:`, emailError);
            }
        }
        
    } catch (error) {
        console.error("Error checking expiring payments:", error);
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});

const checkUpcomingBills = cron.schedule('0 9 * * *', async () => {
    try {
        console.log("📬 Running bill reminder cron job...");

        // Get today's date in UTC, normalized to start of day
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        console.log(`DEBUG: today = ${today.toISOString()}`);

        // Find all unpaid bills
        const bills = await BillModel.find({ isPaid: false });
        console.log(`📋 Found ${bills.length} unpaid bill(s)`);

        for (const bill of bills) {
            try {
                // Get due date and normalize to midnight UTC
                const dueDate = new Date(bill.dueDate);
                dueDate.setUTCHours(0, 0, 0, 0);

                // Calculate reminder date
                const reminderDate = new Date(dueDate);
                reminderDate.setUTCDate(dueDate.getUTCDate() - (bill.reminderDays || 0));
                reminderDate.setUTCHours(0, 0, 0, 0);

                console.log(`DEBUG: Bill ${bill._id} for user ${bill.userId}: reminderDate = ${reminderDate.toISOString()}, dueDate = ${dueDate.toISOString()}`);

                // Check if today is on or after the reminder date and bill is unpaid
                if (today >= reminderDate && !bill.isPaid) {
                    // Find the user
                    const user = await userModel.findById(bill.userId);
                    if (!user || !user.email) {
                        console.error(`⚠️ User not found or email missing for bill ID: ${bill._id}, userId: ${bill.userId}`);
                        continue;
                    }

                    // Check if user is premium
                    if (!user.isPremium) {
                        console.log(`⏩ Skipping bill ${bill._id} for non-premium user ${user.email}`);
                        continue;
                    }

                    // Calculate days until/overdue
                    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                    const isOverdue = daysUntilDue < 0;
                    const subject = isOverdue
                        ? `Overdue: Your ${bill.type} Bill is ${Math.abs(daysUntilDue)} Day${Math.abs(daysUntilDue) !== 1 ? 's' : ''} Past Due`
                        : `Reminder: Your ${bill.type} Bill is Due in ${daysUntilDue} Day${daysUntilDue !== 1 ? 's' : ''}`;

                    // Format due date
                    const formattedDueDate = dueDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    // Create email
                    const mailOptions = {
                        from: process.env.SENDER_EMAIL,
                        to: user.email,
                        subject,
                        html: BILL_REMINDER_TEMPLATE
                            .replace('{{name}}', user.name || 'Valued Customer')
                            .replace(/{{billType}}/g, bill.type || 'Bill')
                            .replace('{{dueDate}}', formattedDueDate)
                            .replace('{{amount}}', bill.amount ? bill.amount.toFixed(2) : '0.00')
                            .replace('{{description}}', bill.description || 'No description provided')
                            .replace('{{recurrence}}', bill.recurrence || 'One-time')
                            .replace('{{billId}}', bill._id.toString())
                    };

                    await transporter.sendMail(mailOptions);
                    console.log(`✅ Reminder email sent for ${bill.type} bill to ${user.email}. ${isOverdue ? `Overdue by ${Math.abs(daysUntilDue)} day(s)` : `Days until due: ${daysUntilDue}`}`);
                } else {
                    console.log(`⏩ Skipping bill ${bill._id}: ${!bill.isPaid ? `before reminder period (reminderDate: ${reminderDate.toISOString()})` : 'bill is paid'}`);
                }
            } catch (billError) {
                console.error(`❌ Failed to process bill ID ${bill._id}:`, billError);
            }
        }

        console.log("✅ Bill reminder cron job completed.");
    } catch (error) {
        console.error('💥 Error in bill reminder cron job:', error);
    }
}, {
    scheduled: true,
    timezone: 'Asia/Kolkata'
});

const sendYearEndBudgetSummary = cron.schedule('0 0 1 1 *', async () => {
    try {
        console.log("📬 Running year-end budget summary cron job...");

        // Initialize currentYear and validate
        // const today = new Date('2026-01-01T00:00:00Z');
        const today = new Date(); // For testing: new Date('2026-01-01T00:00:00Z')
        console.log(`DEBUG: today = ${today}, type = ${typeof today}, is Date instance = ${today instanceof Date}`);

        // Ensure today is a valid Date object
        if (!(today instanceof Date) || isNaN(today)) {
            throw new Error('Invalid Date object for today');
        }

        const currentYear = today.getFullYear() - 1; // Previous year
        console.log(`🗓️ Generating summary for year: ${currentYear}`);

        const users = await userModel.find({});
        console.log(`👥 Found ${users.length} user(s)`);

        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        for (const user of users) {
            console.log(`🔍 Processing user: ${user.email}`);

            // Fetch all budgets for the user and year in UTC
            const startOfYearUTC = new Date(Date.UTC(currentYear, 0, 1));
            const endOfYearUTC = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999)); // Include full millisecond range

            console.log(`DEBUG: Querying budgets for ${user.email} from ${startOfYearUTC.toISOString()} to ${endOfYearUTC.toISOString()}`);

            const budgets = await BudgetModel.find({
                userId: user._id,
                startDate: { $gte: startOfYearUTC },
                endDate: { $lte: endOfYearUTC }
            });

            if (budgets.length === 0) {
                console.log(`⚠️ No budgets found for user ${user.email} for ${currentYear}`);
                continue;
            }

            console.log(`📊 Found ${budgets.length} budget(s) for ${user.email}:`, budgets.map(b => ({
                _id: b._id,
                title: b.title,
                startDate: b.startDate,
                endDate: b.endDate,
                amount: b.amount,
                used: b.used,
                period: b.period
            })));

            let budgetRows = '';
            let totalBudget = 0;
            let totalUsed = 0;

            // Group budgets by month
            for (let month = 0; month < 12; month++) {
                const monthBudgets = budgets.filter(b => {
                    const startDate = new Date(b.startDate);
                    return startDate instanceof Date && !isNaN(startDate) && startDate.getMonth() === month;
                });

                if (monthBudgets.length === 0) continue;

                let monthlyBudgetHtml = '';
                const monthlyBudget = monthBudgets.find(b => b.period === 'monthly');
                if (monthlyBudget) {
                    totalBudget += monthlyBudget.amount;
                    totalUsed += monthlyBudget.used || 0;
                    monthlyBudgetHtml = `
                        <tr class="monthly-budget">
                            <td><strong>${monthlyBudget.title}</strong></td>
                            <td><strong>₹${monthlyBudget.amount.toLocaleString('en-IN')}</strong></td>
                            <td><strong>₹${(monthlyBudget.used || 0).toLocaleString('en-IN')}</strong></td>
                        </tr>
                    `;
                }

                const otherBudgetRows = monthBudgets
                    .filter(b => b.period !== 'monthly')
                    .map(budget => {
                        totalBudget += budget.amount;
                        totalUsed += budget.used || 0;
                        return `
                            <tr class="separate-budget">
                                <td>${budget.title} (${budget.category})</td>
                                <td>₹${budget.amount.toLocaleString('en-IN')}</td>
                                <td>₹${(budget.used || 0).toLocaleString('en-IN')}</td>
                            </tr>
                        `;
                    })
                    .join('');

                budgetRows += `
                    <tr><th colspan="3" style="background-color: #e2e8f0; font-size: 16px;">${months[month]}</th></tr>
                    ${monthlyBudgetHtml || '<tr><td colspan="3">No monthly budget set</td></tr>'}
                    ${otherBudgetRows || '<tr><td colspan="3">No separate budgets</td></tr>'}
                `;
            }

            if (!budgetRows) {
                console.log(`⚠️ No budget rows generated for user ${user.email}`);
                continue;
            }

            const mailOptions = {
                from: process.env.SENDER_EMAIL,
                to: user.email,
                subject: `Your ${currentYear} Budget Summary`,
                html: YEAR_END_BUDGET_SUMMARY_TEMPLATE
                    .replace('{{year}}', currentYear)
                    .replace('{{year}}', currentYear)
                    .replace('{{year + 1}}', currentYear+1)
                    .replace('{{name}}', user.name)
                    .replace('{{budgetRows}}', budgetRows)
                    .replace('{{totalBudget}}', totalBudget.toLocaleString('en-IN'))
                    .replace('{{totalUsed}}', totalUsed.toLocaleString('en-IN'))
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log(`✅ Year-end summary sent to ${user.email}`);

                // Delete all budgets for the user and year
                await BudgetModel.deleteMany({
                    userId: user._id,
                    startDate: { $gte: startOfYearUTC },
                    endDate: { $lte: endOfYearUTC }
                });

                console.log(`🗑️ Budgets cleared for ${user.email} for ${currentYear}`);
            } catch (emailError) {
                console.error(`❌ Failed to send year-end summary to ${user.email}:`, emailError);
            }
        }

        console.log("✅ Year-end summary cron job completed.");
    } catch (error) {
        console.error('💥 Error in year-end budget summary cron job:', error);
    }
}, {
    scheduled: true,
    timezone: 'Asia/Kolkata'
});

const sendMonthlyBudgetSummary = cron.schedule('0 0 1 * *', async () => {
    try {
        console.log("📬 Running monthly budget summary cron job...");

        // Get today's date
        const today = new Date(); // June 1, 2025

        // Calculate reference month (previous month)
        const referenceMonth = today.getMonth() - 1;
        const referenceYear = referenceMonth < 0 ? today.getFullYear() - 1 : today.getFullYear();
        const targetMonth = (referenceMonth + 12) % 12;
        const lastDayOfReferenceMonth = new Date(referenceYear, targetMonth + 1, 0).getDate();

        console.log(`🗓️ Generating summary for: ${targetMonth + 1}/${referenceYear}`);

        const users = await userModel.find({});
        console.log(`👥 Found ${users.length} user(s)`);

        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        for (const user of users) {
            console.log(`🔍 Processing user: ${user.email}`);

            // Query budgets for the previous month in UTC
            const startOfMonthUTC = new Date(Date.UTC(referenceYear, targetMonth, 1));
            const endOfMonthUTC = new Date(Date.UTC(referenceYear, targetMonth, lastDayOfReferenceMonth, 23, 59, 59));

            console.log(`Querying budgets for ${user.email} from ${startOfMonthUTC.toISOString()} to ${endOfMonthUTC.toISOString()}`);

            const budgets = await BudgetModel.find({
                userId: user._id,
                startDate: { $lte: endOfMonthUTC },
                endDate: { $gte: startOfMonthUTC }
            });

            if (budgets.length === 0) {
                console.log(`⚠️ No budgets found for user ${user.email} for ${months[targetMonth]} ${referenceYear}`);
                continue;
            }

            console.log(`📊 Found ${budgets.length} budget(s) for ${user.email}`);

            let totalBudget = 0;
            let totalUsed = 0;

            const budgetRows = budgets.map(budget => {
                totalBudget += budget.amount;
                totalUsed += budget.used || 0;
                return `
                    <tr>
                        <td>${budget.title} (${budget.category})</td>
                        <td>₹${budget.amount.toLocaleString('en-IN')}</td>
                        <td>₹${(budget.used || 0).toLocaleString('en-IN')}</td>
                    </tr>
                `;
            }).join('');

            const savings = totalBudget - totalUsed;

            const mailOptions = {
                from: process.env.SENDER_EMAIL,
                to: user.email,
                subject: `Your ${months[targetMonth]} ${referenceYear} Budget Summary`,
                html: MONTHLY_BUDGET_SUMMARY_TEMPLATE
                    .replace('{{month}}', months[targetMonth])
                    .replace('{{year}}', referenceYear)
                    .replace('{{month}}', months[targetMonth])
                    .replace('{{year}}', referenceYear)
                    .replace('{{name}}', user.name)
                    .replace('{{totalBudget}}', totalBudget.toLocaleString('en-IN'))
                    .replace('{{totalUsed}}', totalUsed.toLocaleString('en-IN'))
                    .replace('{{savings}}', savings.toLocaleString('en-IN'))
                    .replace('{{budgetRows}}', budgetRows)
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log(`✅ Monthly summary sent to ${user.email}`);
            } catch (emailError) {
                console.error(`❌ Failed to send email to ${user.email}:`, emailError);
            }
        }

        console.log("✅ Monthly summary cron job completed.");
    } catch (error) {
        console.error('💥 Error in monthly budget summary cron job:', error);
    }
}, {
    scheduled: true,
    timezone: 'Asia/Kolkata'
});

// Budget Threshold Alerts (Daily at 8 AM)
const sendBudgetThresholdAlerts = cron.schedule('0 8 * * *', async () => {
    try {
        const today = new Date();
        const users = await userModel.find({});

        for (const user of users) {
            const budgets = await BudgetModel.find({
                userId: user._id,
                startDate: { $lte: today },
                endDate: { $gte: today },
            });

            for (const budget of budgets) {
                const remaining = budget.amount - (budget.used || 0);
                const amount = budget.amount;
                const used = budget.used || 0;
                const tenPercentThreshold = 0.1 * budget.amount;

                // Check for 10% remaining
                if (remaining <= tenPercentThreshold && remaining > 0 && !budget.alert10PercentSent) {
                    const mailOptions = {
                        from: process.env.SENDER_EMAIL,
                        to: user.email,
                        subject: `Budget Alert: ${budget.title} is Almost Exhausted`,
                        html: BUDGET_10_PERCENT_TEMPLATE
                            .replace('{{name}}', user.name)
                            .replace('{{title}}', budget.title)
                            .replace('{{category}}', budget.category)
                            .replace('{{amount}}', amount.toLocaleString('en-IN'))
                            .replace('{{remaining}}', remaining.toLocaleString('en-IN'))
                    };

                    try {
                        await transporter.sendMail(mailOptions);
                        await BudgetModel.updateOne(
                            { _id: budget._id },
                            { $set: { alert10PercentSent: true } }
                        );
                        console.log(`10% alert sent for budget ${budget.title} to ${user.email}`);
                    } catch (emailError) {
                        console.error(`Failed to send 10% alert to ${user.email}:`, emailError);
                    }
                }

                // Check for budget exhausted
                if (remaining <= 0 && !budget.alertExhaustedSent) {
                    const mailOptions = {
                        from: process.env.SENDER_EMAIL,
                        to: user.email,
                        subject: `Budget Alert: ${budget.title} is Fully Used`,
                        html: BUDGET_EXHAUSTED_TEMPLATE
                            .replace('{{name}}', user.name)
                            .replace('{{title}}', budget.title)
                            .replace('{{amount}}', amount.toLocaleString('en-IN'))
                            .replace('{{used}}', used.toLocaleString('en-IN'))
                            .replace('{{remaining}}', remaining.toLocaleString('en-IN'))
                            .replace('{{category}}', budget.category)
                    };

                    try {
                        await transporter.sendMail(mailOptions);
                        await BudgetModel.updateOne(
                            { _id: budget._id },
                            { $set: { alertExhaustedSent: true } }
                        );
                        console.log(`Exhausted alert sent for budget ${budget.title} to ${user.email}`);
                    } catch (emailError) {
                        console.error(`Failed to send exhausted alert to ${user.email}:`, emailError);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error in budget threshold alerts cron job:', error);
    }
}, {
    scheduled: true,
    timezone: 'Asia/Kolkata'
});

export const startCronJobs = () => {
    checkUpcomingBills.start();
    checkExpiringPayments.start();
    sendYearEndBudgetSummary.start();
    sendMonthlyBudgetSummary.start();
    sendBudgetThresholdAlerts.start();
};