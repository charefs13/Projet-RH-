const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
const authguard = async(req,res,next)=>{
    try {
        if(req.session.company){
            let company = await prisma.company.findUnique({
                where:{
                    email: req.session.company.email
                }
            })
            if(company){
                return next()
            }
        }
        throw new Error('Error: You have to Log-In first')
    } catch (error) {
        res.redirect("/login")
    }
}

module.exports = authguard