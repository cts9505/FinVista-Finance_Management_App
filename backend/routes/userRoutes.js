import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { getUserData, monthlyBudget, updateMonthlyBudget } from '../controllers/usercontroller.js';

const userRouter = express.Router();

userRouter.get('/get-data', userAuth, getUserData);
userRouter.get('/get-monthly-budget',userAuth,monthlyBudget);
userRouter.post('/update-monthly-budget',userAuth,updateMonthlyBudget);

export default userRouter;