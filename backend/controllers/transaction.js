import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import multer from 'multer';
import ExpenseModel from '../models/ExpenseModel.js';
import IncomeModel from '../models/IncomeModel.js';

dotenv.config();

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const uploadDir = './uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

export const processOCRImage = async (req, res) => {
    upload.single('file')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file provided" });
        }

        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        if (!['.png', '.jpg', '.jpeg'].includes(fileExtension)) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: "File must be an image (PNG, JPG, JPEG)" });
        }

        try {
            const filePath = req.file.path;
            const fileContent = fs.readFileSync(filePath, { encoding: 'base64' });
            const mimeType = `image/${fileExtension.replace('.', '')}`;

            const imagePart = {
                inlineData: {
                    data: fileContent,
                    mimeType: mimeType
                }
            };

            const prompt = "Extract the text in the image verbatim, including all lines and preserving order";
            const result = await model.generateContent([{ text: prompt }, imagePart]);
            const extractedText = result.response.text();
            console.log("Extracted Text:", extractedText);
            const paymentMethod = req.body.paymentMethod || "UPI - Online";
            const autoCategorize = req.body.autoCategorize === 'true';

            const transactions = processOCRToJsonMultiple(extractedText, req.userId);

            const savedTransactions = [];
            for (const transaction of transactions) {
                const Model = transaction.type === 'income' ? IncomeModel : ExpenseModel;
                const isValidDate = transaction.date && transaction.date !== "unknown";
                const currentDate = new Date().toISOString();

                let status = transaction.status || 'pending';
                let description = transaction.description || "";
                let category = paymentMethod;

                // Check for duplicates
                const duplicateCheck = await Model.findOne({
                    userId: req.userId,
                    title: transaction.title,
                    amount: transaction.amount,
                    date: isValidDate ? new Date(transaction.date) : new Date(currentDate),
                    status: { $ne: 'duplicate' }
                });
                if (duplicateCheck) {
                    status = 'duplicate';
                    description += " - Duplicate";
                }

                if (status === 'failed') {
                    description += " - Failed";
                } else if (!isValidDate) {
                    status = 'error';
                    description += " - Date not found";
                    transaction.date = currentDate;
                } else {
                    description += " - Successful";
                }

                if (autoCategorize && status !== 'failed' && status !== 'error') {
                    const autoCategory = categorizeTransaction(transaction.title, description);
                    if (autoCategory === "Uncategorized") autoCategory = "Miscellaneous";
                    // Add category to user's custom categories if it doesn't exist
                    const categoryType = transaction.type === 'income' ? 'income' : 'expense';
                    const added = await addCustomCategory(req.userId, autoCategory, categoryType);
                    category = autoCategory;
                }

                const dbTransaction = new Model({
                    userId: req.userId,
                    title: transaction.title,
                    amount: transaction.amount,
                    date: new Date(transaction.date),
                    category: category,
                    description: description,
                    type: transaction.type,
                    status: status,
                });

                await dbTransaction.save();
                savedTransactions.push({
                    id: dbTransaction._id,
                    title: dbTransaction.title,
                    amount: dbTransaction.amount,
                    date: dbTransaction.date.toISOString(),
                    category: dbTransaction.category,
                    description: dbTransaction.description,
                    type: dbTransaction.type,
                    status: dbTransaction.status,
                });
            }

            fs.unlinkSync(filePath);

            res.json({
                success: true,
                filePath: filePath,
                transactions: savedTransactions,
                message: "Image processed and transactions saved successfully"
            });
        } catch (error) {
            fs.unlinkSync(req.file.path);
            res.status(500).json({ success: false, message: `Processing error: ${error.message}` });
        }
    });
};

export const getPendingTransactions = async (req, res) => {
    try {
        const userId = req.userId;
        const pendingExpenses = await ExpenseModel.find({
            userId,
            status: 'pending',
            date: { $ne: null }
        }).sort({ createdAt: -1 });

        const pendingIncomes = await IncomeModel.find({
            userId,
            status: 'pending',
            date: { $ne: null }
        }).sort({ createdAt: -1 });

        const pendingTransactions = [...pendingExpenses, ...pendingIncomes].map(tx => ({
            id: tx._id,
            title: tx.title,
            amount: tx.amount,
            date: tx.date.toISOString(),
            category: tx.category,
            description: tx.description,
            type: tx.type,
            status: tx.status,
        })).sort((a, b) => {
            const errorOrder = { 'failed': 4, 'duplicate': 3, 'error': 2, 'pending': 1, 'verified': 0 };
            return errorOrder[b.status] - errorOrder[a.status];
        });

        res.json({
            success: true,
            pendingTransactions,
            message: "Pending transactions retrieved successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Error fetching pending transactions: ${error.message}`
        });
    }
};

export const getAllTransactions = async (req, res) => {
    try {
        const userId = req.userId;
        const expenses = await ExpenseModel.find({ userId }).sort({ createdAt: -1 });
        const incomes = await IncomeModel.find({ userId }).sort({ createdAt: -1 });

        const allTransactions = [...expenses, ...incomes].map(tx => ({
            id: tx._id,
            title: tx.title,
            amount: tx.amount,
            date: tx.date.toISOString(),
            category: tx.category,
            description: tx.description,
            type: tx.type,
            status: tx.status,
        })).sort((a, b) => {
            const errorOrder = { 'failed': 4, 'duplicate': 3, 'error': 2, 'pending': 1, 'verified': 0 };
            return errorOrder[b.status] - errorOrder[a.status];
        });

        res.json({
            success: true,
            transactions: allTransactions,
            message: "All transactions retrieved successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Error fetching all transactions: ${error.message}`
        });
    }
};

export const updateTransaction = async (req, res) => {
    try {
      const { id } = req.params;
      const { title, amount, date, category, description, type, status } = req.body;
  
      // Determine the model based on the provided or existing type
      let Model;
      if (type) {
        Model = type === 'income' ? IncomeModel : ExpenseModel;
      } else {
        // If type is not provided, find the existing transaction to determine the model
        const existingIncome = await IncomeModel.findById(id);
        if (existingIncome) {
          Model = IncomeModel;
        } else {
          const existingExpense = await ExpenseModel.findById(id);
          if (existingExpense) {
            Model = ExpenseModel;
          } else {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
          }
        }
      }
  
      // Build the update object with only provided fields
      const updateFields = {};
      if (title !== undefined) updateFields.title = title;
      if (amount !== undefined) updateFields.amount = amount;
      if (date !== undefined) updateFields.date = new Date(date);
      if (category !== undefined) updateFields.category = category;
      if (description !== undefined) updateFields.description = description;
      if (type !== undefined) updateFields.type = type;
      if (status !== undefined) updateFields.status = status;
  
      // Validate date if provided
      if (date !== undefined && isNaN(new Date(date).getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date format' });
      }
  
      // Update the transaction
      const updatedTx = await Model.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: true }
      );
  
      if (!updatedTx) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }
  
      res.json({ success: true, transaction: updatedTx });
    } catch (error) {
      console.error('Error updating transaction:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

export const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const Model = req.body.type === 'income' ? IncomeModel : ExpenseModel;
        const deletedTx = await Model.findByIdAndDelete(id);
        if (!deletedTx) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }
        res.json({ success: true, message: "Transaction deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error deleting transaction: ${error.message}` });
    }
};

export const verifyAllTransactions = async (req, res) => {
    try {
        const userId = req.userId;
        const token = req.headers.authorization.split(' ')[1]; // Extract token
        const editableTxs = await ExpenseModel.find({ userId, status: { $in: ['pending', 'error', 'duplicate'] } })
            .sort({ createdAt: -1 });
        const editableIncomes = await IncomeModel.find({ userId, status: { $in: ['pending', 'error', 'duplicate'] } })
            .sort({ createdAt: -1 });

        const allEditableTxs = [...editableTxs, ...editableIncomes];
        for (const tx of allEditableTxs) {
            const updatedData = {
                title: tx.title,
                amount: tx.amount,
                date: tx.date,
                category: tx.category,
                description: tx.description,
                type: tx.type,
                status: 'verified'
            };
            const Model = tx.type === 'income' ? IncomeModel : ExpenseModel;
            await Model.findByIdAndUpdate(tx._id, updatedData, { new: true });
        }
        res.json({ success: true, message: "All eligible transactions verified successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error verifying all transactions: ${error.message}` });
    }
};

export const deleteAllDuplicates = async (req, res) => {
    try {
        const userId = req.userId;
        const duplicateTxs = await ExpenseModel.find({ userId, status: 'duplicate' });
        const duplicateIncomes = await IncomeModel.find({ userId, status: 'duplicate' });

        const allDuplicateTxs = [...duplicateTxs, ...duplicateIncomes];
        for (const tx of allDuplicateTxs) {
            const Model = tx.type === 'income' ? IncomeModel : ExpenseModel;
            await Model.findByIdAndDelete(tx._id);
        }
        res.json({ success: true, message: "All duplicate transactions deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error deleting duplicate transactions: ${error.message}` });
    }
};

function processOCRToJsonMultiple(extractedText, userId) {
    const transactions = [];
    const months = ["January", "February", "March", "April", "May", "June", 
                    "July", "August", "September", "October", "November", "December"];

    const lines = extractedText.trim().split('\n').map(line => line.trim());

    const nameAmountPattern = /^([A-Z][^₹]+)?₹?(\d+(?:\.\d{2})?)$/;
    const namePattern = /^([A-Z][^\d₹]+)$/;
    const amountPattern = /₹?(\d+(?:,\d+)*(?:\.\d{2})?)$/;
    const datePattern = /(\d{1,2}\s+[A-Za-z]+|\d{1,2} [A-Za-z]+ \d{4})/;
    const failedPattern = /(?:☑|✗|×)\s*Failed/i; // Updated to match ☑, ✗, or × Failed
    const headerPattern = /Status|Payment method|Date|^\d{4}$|Search transactions|:|23:11/i;

    let currentName = "";
    let currentAmount = 0;
    let currentDate = "";
    let currentType = "expense";

    console.log("Starting transaction parsing...");

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        console.log(`Line ${i}: "${line}"`);

        if (headerPattern.test(line)) {
            console.log("Skipping header line");
            continue;
        }

        if (failedPattern.test(line)) {
            if (transactions.length > 0) {
                const lastTransaction = transactions[transactions.length - 1];
                console.log(`Applying 'failed' status to last transaction: ${lastTransaction.title}`);
                lastTransaction.status = "failed";
                lastTransaction.description = " - Transaction failed";
            } else {
                console.log("No previous transaction to mark as failed");
            }
            continue;
        }

        let dateMatch = line.match(datePattern);
        if (dateMatch) {
            currentDate = dateMatch[1];
            try {
                let parsedDate = new Date(currentDate + " 2025");
                if (isNaN(parsedDate.getTime())) {
                    parsedDate = new Date(currentDate + " " + new Date().getFullYear());
                }
                currentDate = parsedDate.toISOString();
            } catch (e) {
                currentDate = "unknown";
            }
            console.log(`Found date: ${currentDate}`);
            continue;
        }

        let nameMatch = line.match(namePattern);
        if (nameMatch && !months.some(month => month.toLowerCase() === line.toLowerCase())) {
            if (currentName && currentAmount > 0 && currentDate) {
                console.log(`Pushing transaction: ${currentName}, ${currentAmount}, ${currentType}, ${currentDate}`);
                transactions.push({
                    userId,
                    title: currentName.trim(),
                    amount: currentAmount,
                    category: "Google Pay",
                    description: "",
                    date: currentDate,
                    type: currentType,
                    status: "pending"
                });
                currentName = "";
                currentAmount = 0;
                currentDate = "";
                currentType = "expense";
            }
            currentName = nameMatch[0].trim();
            console.log(`Found name: ${currentName}`);
            continue;
        }

        let amountMatch = line.match(amountPattern);
        if (amountMatch) {
            currentAmount = parseFloat(amountMatch[1].replace(/,/g, '')) || 0;
            currentType = line.includes("+") || line.includes("credited") || line.includes("received") || line.includes("to") ? "income" : "expense";
            console.log(`Found amount: ${currentAmount}, ${currentType}`);
            if (currentName && currentDate) {
                console.log(`Pushing transaction: ${currentName}, ${currentAmount}, ${currentType}, ${currentDate}`);
                transactions.push({
                    userId,
                    title: currentName.trim(),
                    amount: currentAmount,
                    category: "Google Pay",
                    description: "",
                    date: currentDate,
                    type: currentType,
                    status: "pending"
                });
                currentName = "";
                currentAmount = 0;
                currentDate = "";
                currentType = "expense";
            }
            continue;
        }
    }

    if (currentName && currentAmount > 0 && currentDate) {
        console.log(`Pushing final transaction: ${currentName}, ${currentAmount}, ${currentType}, ${currentDate}`);
        transactions.push({
            userId,
            title: currentName.trim(),
            amount: currentAmount,
            category: "Google Pay",
            description: "",
            date: currentDate,
            type: currentType,
            status: "pending"
        });
    }

    console.log("Parsed transactions:", JSON.stringify(transactions, null, 2));
    return transactions;
}

function categorizeTransaction(title, description) {
    const lowerTitle = title.toLowerCase();
    const lowerDescription = description.toLowerCase();

    if (lowerTitle.includes("failed") || lowerDescription.includes("failed")) {
        return "Failed Transaction";
    }

    const keywordMap = {
        "Food": [
            "food", "wada", "vada", "pav", "samosa", "idli", "dosa", "uttapam", "poha", "upma", "biryani",
            "paratha", "roti", "naan", "thali", "dal", "sabzi", "paneer", "butter chicken", "chole", "rajma",
            "tandoori", "kebab", "pulao", "khichdi", "snacks", "lunch", "dinner", "breakfast", "meal",
            "chai", "tea", "coffee", "lassi", "juice", "cold drink", "kulfi", "ice cream", "sweet", "mithai",
            "halwa", "gulab jamun", "rasgulla", "jalebi", "modak", "sheera", "barfi", "peda", "sweets",
            "restaurant", "hotel", "mess", "canteen", "dhaba", "tiffin", "eatery", "bhojnalaya", "cafe", "bakery",
            "swiggy", "zomato", "domino", "pizza", "kfc", "mcdonald", "burger king", "delivery"
        ],
        "Shopping": [
            "shop", "shopping", "store", "mart", "supermarket", "big bazaar", "dmart", "reliance", "more","shopi",
            "fashion", "apparel", "clothing", "footwear", "lifestyle", "zudio", "max", "pantaloons", "trends"
        ],
        "Subscription": [
            "netflix", "amazon prime", "hotstar", "zee5", "sony liv", "spotify", "gaana", "wynk", "youtube premium",
            "apple music", "prime video", "ott", "disney+", "crunchyroll", "subscription", "recur", "renewal"
        ],
        "Recharge / Mobile": [
            "airtel", "vi", "vodafone", "jio", "recharge", "mobile recharge", "top-up", "talktime", "prepaid", "postpaid",
            "data pack", "sms pack", "telecom", "balance"
        ],
        "Bills / Utilities": [
            "electricity", "water bill", "gas bill", "mseb", "mahadiscom", "torrent power", "adani electricity",
            "broadband", "internet", "wifi", "wi-fi", "billdesk", "bharat billpay", "utility bill", "energy", "maintenance"
        ],
        "Transport / Travel": [
            "ola", "uber", "rapido", "cab", "rickshaw", "bus", "train", "railway", "irctc", "flight", "air india", 
            "goair", "indigo", "vistara", "metro", "taxi", "travel", "trip", "yatra", "makemytrip", "cleartrip"
        ],
        "Medical / Health": [
            "pharmacy", "chemist", "apollo", "medplus", "1mg", "pharmeasy", "doctor", "hospital", "clinic", 
            "diagnostic", "medicines", "prescription", "health", "wellness", "checkup", "scan", "xray", "pathology"
        ]
    };

    for (const [category, keywords] of Object.entries(keywordMap)) {
        for (const keyword of keywords) {
            if (lowerTitle.includes(keyword) || lowerDescription.includes(keyword)) {
                return category;
            }
        }
    }

    return "Uncategorized";
}

import userModel from '../models/model.js'; // Adjust the path to your userModel

async function addCustomCategory(userId, categoryName, categoryType) {
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const newCategory = { name: categoryName };
        if (categoryType === 'income') {
            // Check if category already exists
            const exists = user.onboardingData.customIncomeCategories.some(
                cat => cat.name.toLowerCase() === categoryName.toLowerCase()
            );
            if (!exists) {
                user.onboardingData.customIncomeCategories.push(newCategory);
            }
        } else {
            // Check if category already exists
            const exists = user.onboardingData.customExpenseCategories.some(
                cat => cat.name.toLowerCase() === categoryName.toLowerCase()
            );
            if (!exists) {
                user.onboardingData.customExpenseCategories.push(newCategory);
            }
        }

        await user.save();
        return true;
    } catch (error) {
        console.error('Error adding custom category:', error);
        return false;
    }
}