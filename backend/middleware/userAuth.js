import jwt from 'jsonwebtoken';
import userModel from '../models/model.js';

const userAuth = async (req, res, next) => {
  
    const {token} = req.cookies;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized !' });
    }
    
    try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    if(decoded.id){
        req.body.userId = decoded.id;
        req.userId=decoded.id;

        const user = await userModel.findById(req.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found!' });
        }
        
        // Check if account is deactivated
        if (user.isDeactivated) {
          // Reactivate account if user attempts to log in
          user.isDeactivated = false;
          user.accountDeletionDate = null;
          user.lastLogin = new Date();
          await user.save();
        }
    }
    else{
        return res.status(401).json({ success: false, message: 'Unauthorized !' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export default userAuth;