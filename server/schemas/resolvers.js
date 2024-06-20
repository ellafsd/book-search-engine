const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {   //name for destructured object, logged in not logged in
        me: async (parent, args, context) => {
            if (context.user) {       //Finding one person                                                //current version of password
                const userData = await User.findOne({ _id: context.user._id }).select("-__v -password")
                return userData;
            }//Gives an error to user signing up if credentials are not met
            throw AuthenticationError;
        }
    },
    Mutation: {//sign up a new user 
        addUser: async (parent, args) => {
            console.log("add user args", args);

            const user = await User.create(args);
            console.log("add user ", user);

            const token = signToken(user); // takes the method from auth (gives JWT token)
            console.log("add user token", token);

            return { token, user };

        },//assigning the token to the user

        //logging in with e-mail and password
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw AuthenticationError;
            }//checks to see if user credentials are met or not
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw AuthenticationError;
            }//checks to see if password credentials are correct or not
            const token = signToken(user);
            return { token, user };
        },//takes in book data of user
        saveBook: async (parent, { bookData }, context) => {
            if (context.user) {//needs to be logged in
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id }, //takes ID and updates the user
                    { $push: { savedBooks: bookData } }, //push it to the end of the array
                    { new: true }//add new book into the array
                );
                return updatedUser; //gives results of the updated books by the user's login information
            }
            throw AuthenticationError;
        },//deletes a book based on its id
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );
                return updatedUser;
            }
            throw AuthenticationError;
        },
    }
}
module.exports = resolvers;