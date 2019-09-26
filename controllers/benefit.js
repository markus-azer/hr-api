const { Benefit } = models;

module.exports = {
    create: async (req, res, next) => {
        const { type, title, body } = req.body;

        await Benefit.create({ type, title, body });

        return next({ message: `Benefit created successfully`});
    },
    find: async (req, res, next) =>{
        //TODO: Use pagination
        const { title } = req.query;
        const query = (!empty(title))?{title: { $regex: title, $options: 'gi'}, deletedAt: {$exists: false}}:{deletedAt: {$exists: false}};

        const benefits = await Benefit.find(query, '-_id id type title body createdAt updatedAt').lean();

        return next({data: {benefits}});
    },
    update: async (req, res, next) =>{
        const { id } = req.params;
        const data = req.body;


        const result = await Benefit.updateOne({id, deletedAt: {$exists: false}}, data);

        if(result.n !== 1)
            throw new CustomError(`Benefit Not found Or already Deleted`, 400);

        return next({ message: 'Updated Successfully' });

    },
    remove: async (req, res, next) =>{
        const { id } = req.params;

        const result = await Benefit.updateOne({id, deletedAt: {$exists: false}}, {deletedAt: Date.now()});

        if(result.n !== 1)
            throw new CustomError(`Benefit Not found Or already Deleted`, 400);
        
        return next({ message: 'Deleted Successfully' });
    },
}