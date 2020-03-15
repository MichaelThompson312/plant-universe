const Mutations = {
	//This is a resolver
	async createItem(parents, args, ctx, info) {
		//TODO check if they are logged int

		const item = await ctx.db.mutation.createItem(
			{
				data: {
					...args
				}
			},
			info
		);

		return item;
	}
};

module.exports = Mutations;
