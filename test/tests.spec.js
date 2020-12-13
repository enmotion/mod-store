import EBS from "../src"

const db1 = new EBS({
    namespace:"morez",
    props:{
        name:{
            type:String,
            default:"mod",
        },
        age:{
            type:[String,Number]
        }
    }
})

console.log(db1.$data)