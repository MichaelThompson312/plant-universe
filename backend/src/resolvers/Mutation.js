const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { hasPermission } = require('../utils');

const Mutations = {
	//This is a resolver
	async createItem(parents, args, ctx, info) {
		//TODO check if they are logged int
		if (!ctx.request.userId) {
			throw new Error('You must be logged in to post an item');
		}
		const item = await ctx.db.mutation.createItem(
			{
				data: {
					//this is how we create a relationship between the item and the user
					user: {
						connect: {
							id: ctx.request.userId
						}
					},
					...args
				}
			},
			info
		);

		return item;
	},
	updateItem(parent, args, ctx, info) {
		// first take a copy of the updates
		const updates = { ...args };
		// remove the ID from the updates
		delete updates.id;
		// run the update method
		return ctx.db.mutation.updateItem(
			{
				data: updates,
				where: {
					id: args.id
				}
			},
			info
		);
	},
	async deleteItem(parent, args, ctx, info) {
		const where = { id: args.id };
		// 1. find the item
		const item = await ctx.db.query.item({ where }, `{ id title user { id } }`);
		// 2. Check if they own that item, or have the permissions
		const ownsItem = item.user.id === ctx.request.userId;
		const hasPermission = ctx.request.user.permissions.some((permission) =>
			[ 'ADMIN', 'ITEMDELETE' ].includes(permission)
		);
		if (!ownsItem && !hasPermission) {
			throw new Error('You do not haev permission to do that');
		}
		//TODO
		// 3. Delete it!
		return ctx.db.mutation.deleteItem({ where }, info);
	},
	async signup(parent, args, ctx, info) {
		args.email = args.email.toLowerCase();
		//Hash the password
		const password = await bcrypt.hash(args.password, 10);

		//create the user in the database
		const user = await ctx.db.mutation.createUser(
			{
				data: {
					...args,
					password,
					permissions: { set: [ 'USER' ] }
				}
			},
			info
		);
		const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

		ctx.response.cookie('token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365
		});
		//return user to the browser
		return user;
	},
	async signin(parent, { email, password }, ctx, info) {
		const user = await ctx.db.query.user({ where: { email } });
		if (!user) {
			throw new Error(`No such user found for email ${email}`);
		}

		const valid = await bcrypt.compare(password, user.password);
		if (!valid) {
			throw new Error('Invalid Password!');
		}

		const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

		ctx.response.cookie('token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365
		});

		return user;
	},
	signout(parent, args, ctx, info) {
		ctx.response.clearCookie('token');
		return { message: 'Goodbye' };
	},
	async requestReset(parent, args, ctx, info) {
		//Check if it is a real user
		const user = await ctx.db.query.user({ where: { email: args.email } });
		if (!user) {
			throw new Error('No User found');
		}
		//set a reset tokena dn expiry
		const resetToken = (await promisify(randomBytes)(20)).toString('hex');
		const resetTokenExpiry = Date.now() + 3600000;
		const response = await ctx.db.mutation.updateUser({
			where: { email: args.email },
			data: { resetToken, resetTokenExpiry }
		});
		//TODO remove console.log if going to production
		console.log(response);
		return { message: 'Thanks ' };
		//email them that reset token
	},
	async resetPassword(parent, args, ctx, info) {
		//check if the passwords match
		if (args.password !== args.confirmPassword) {
			throw new Error('passwords do not match');
		}
		//check if it is a legit reset token
		const [ user ] = await ctx.db.query.users({
			where: {
				resetToken: args.resetToken,
				resetTokenExpiry_gte: Date.now() - 3600000
			}
		});
		//check if it is expired
		if (!user) {
			throw new Error('This token is either invalid or expired');
		}
		//hash their new password
		const password = await bcrypt.hash(args.password, 10);
		//save new password to user
		//remove old reset token feilds
		const updatedUser = await ctx.db.mutation.updateUser({
			where: { email: user.email },
			data: {
				password,
				resetToken: null,
				resetTokenExpiry: null
			}
		});
		//generate jwt
		const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
		//set jwt cookie
		ctx.response.cookie('token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365
		});
		//return new user
		return updatedUser;
	},
	async updatePermissions(parent, args, ctx, info) {
		//CHeck if they are logged in
		if (!ctx.request.userId) {
			throw new Error('You must be logged in!');
		}
		// 2. Query the current user
		const currentUser = await ctx.db.query.user(
			{
				where: {
					id: ctx.request.userId
				}
			},
			info
		);
		// 3. Check if they have permissions to do this
		hasPermission(currentUser, [ 'ADMIN', 'PERMISSIONUPDATE' ]);
		// 4. Update the permissions
		return ctx.db.mutation.updateUser(
			{
				data: {
					permissions: {
						set: args.permissions
					}
				},
				where: {
					id: args.userId
				}
			},
			info
		);
	}
};

module.exports = Mutations;
