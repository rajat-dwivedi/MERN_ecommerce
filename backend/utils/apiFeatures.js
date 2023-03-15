class ApiFeatures{
    constructor(query, queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }

    search(){
        const keyword = this.queryStr.keyword ? {
            //using regex to follow pattern all the items beginning with name
            name : {
                $regex : this.queryStr.keyword,
                $options: "i" //making it case insensetive search
            },
        }:{}

        // console.log(keyword);
        this.query = this.query.find({...keyword})
        return this;
    }

    filter(){
        //creating a copy (not by reference)
        
        const queryCopy = {...this.queryStr};
        // console.log(queryCopy)
        //removing fields for category
        const removeFields = ["keyword","page","limit"]

        removeFields.forEach(key => delete queryCopy[key]);
        // console.log(queryCopy)

        //price and rating
        let queryStr = JSON.stringify(queryCopy);
        //applying $ before gt, gte, le or lte - to convert to mongo query 
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);
    
        this.query = this.query.find(JSON.parse(queryStr));
        return this
    }

    pagination(resPerPage){
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resPerPage * (currentPage-1)
        this.query = this.query.limit(resPerPage).skip(skip)
        return this;
    }
}

module.exports = ApiFeatures