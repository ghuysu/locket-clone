/split search value to search more flexibly
        const searchTerms = searchValue.split(' ').filter(term => term.length > 0)
        //set up search conditions
        const searchConditions = searchTerms.map(term => ({
            $or: [
                { 'fullname.firstname': { $regex: term, $options: 'i' } },
                { 'fullname.lastname': { $regex: term, $options: 'i' } }
            ]
        }))
        const users = await User.find({
            $and: [
                { _id: { $ne: userId } }, // skip current user
                { $and: searchConditions }
            ]
        }).select('_id fullname').lean()