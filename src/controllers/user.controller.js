import User from "../models/user.model.js";

export const findUser = async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await User.findById(userId).select("-password");
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};
export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};
