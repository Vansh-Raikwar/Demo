
const wrap = (fn)=>{
    return function(req,res,next){
        fn(req,res,next).catch(err => console.log(err));
    }
}
module.exports=wrap;