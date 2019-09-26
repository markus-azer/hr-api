const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');
const { User, Token, RestrictedToken } = models;
const { JWT_SECRET_TOKEN } = serverConfig;

const { updateMongooseObject, generateRandomToken, emailTemplates, sendMail } = require('../utilities');
const { userInvitation } = emailTemplates;

/** Helpers */

// Create and assign a token 60 * 60 * 24 * 30 => expires in 30 days
const signToken = ({id}) => jwt.sign({ id }, JWT_SECRET_TOKEN, { expiresIn: 2592000 });

module.exports = {
    inviteUser: async (req, res, next) =>{
        const { email } = req.body;

        const tokenPromise = generateRandomToken(20);
        const foundEmailPromise = User.findOne({email}).lean();
        const foundTokenPromise = Token.findOne({email, type: 'createAccount'}).lean();

        const [token, foundEmail, foundToken] = await Promise.all([tokenPromise, foundEmailPromise, foundTokenPromise]);

        if(!empty(foundEmail))
            throw new CustomError(`Email:- ${email} already Exist`,400);

        if(!empty(foundToken))
            throw new CustomError(`${email}, Email invitation had been already send`,400);

        await Token.create({
            type: 'createAccount',
            token,
            email
        });

        const html = userInvitation(token, email);

        sendMail({ to: email, subject: "User Invitation" , html }, (err) => {
            if (err)
                return next(err);

            return next({ message: `Email had been send successfully to ${email}`});
        });
    },
    create: async (req, res, next) => {
        const { token, email, password, fullName } = req.body;

        const foundToken = await Token.findOne({token, email, type: 'createAccount'}).lean();

        if(empty(foundToken))
            throw new CustomError(`unauthorized`, 401);

        Token.deleteOne({token, email, type: 'createAccount'}).exec();

        await User.create({
            local: {
                email,
                password,
            },
            fullName
        });

        return next({ message: `Account created successfully, Please login`});
    },
    signIn : async(req, res, next) => {
        const {id, fullName} = req.user;

        return next({ data: {token: signToken({ id, fullName })} });
    },
    signOut: async (req, res, next) => {
        const token = req.headers["authorization"].replace('Bearer ', '');

        RestrictedToken.create({token});

        return next({ message: 'Sign Out Successfully' });
    },
    getProfile: async (req, res, next) => {
        const {id, email, type, manager, department, fullName, phoneNumber, gender} = req.user;
        let { birthday } = req.user;
        birthday = birthday && birthday.date && moment(birthday.date, 'YYYYMMDD HH:mm:ss').tz( birthday.timeZone).format();

        return next({ data: {id, email, type, manager, department, fullName, phoneNumber, birthday, gender} });
    },
    updateProfile: async (req, res, next) => {
        const {_id} = req.user;
        const data = req.body;
        const user = await User.findOne({_id});

        //Set Birthday Format
        if(!empty(data.birthday)){
            const date = (new Date(data.birthday)).setHours(0,0,0,0);
            data.birthday = {
                date: moment.tz(date, "Egypt").utc().format(),
                timeZone: "Egypt"
            }
        }

        updateMongooseObject(user, data);
        await user.save();

        return next({ message: 'Updated Successfully' });
    },
    find: async (req, res, next) =>{
        //TODO: Use pagination
        const { fullName } = req.query;
        const query = (!empty(fullName))?{fullName: { $regex: fullName, $options: 'gi'}}:{};

        const users = await User.find(query, '-_id id email type manager department fullName birthday phoneNumber gender deletedAt').lean();

        return next({data: {users: users.map(user =>{
            user.birthday = user.birthday && user.birthday.date && moment(user.birthday.date, 'YYYYMMDD HH:mm:ss').tz( user.birthday.timeZone).format();
            return user;
        })}});
    },
    get: async (req, res, next) =>{
        const { id } = req.params;

        const user = await User.findOne({id}, '-_id id email type manager department fullName birthday phoneNumber gender deletedAt').lean();

        if(empty(user))
            throw new CustomError(`User not found`, 400);

        user.birthday = user.birthday && user.birthday.date && moment(user.birthday.date, 'YYYYMMDD HH:mm:ss').tz( user.birthday.timeZone).format();

        return next({data: {user}});
    },
    update: async (req, res, next) =>{
        const { id } = req.params;
        const data = req.body;

        const user = await User.findOne({id});

        //Set Birthday Format
        if(!empty(data.birthday)){
            const date = (new Date(data.birthday)).setHours(0,0,0,0);
            data.birthday = {
                date: moment.tz(date, "Egypt").utc().format(),
                timeZone: "Egypt"
            }
        }

        updateMongooseObject(user, data);
        await user.save();

        return next({ message: 'Updated Successfully' });

    },
    remove: async (req, res, next) =>{
        const { id } = req.params;

        const result = await User.updateOne({id, deletedAt: {$exists: false}}, {deletedAt: Date.now()});

        if(result.n !== 1)
            throw new CustomError(`User Not found Or already Deactivated`, 400);
        
        return next({ message: 'Deactivated Successfully' });
    },
}