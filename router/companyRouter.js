const companyRouter = require('express').Router();
const bcrypt = require('bcrypt')
const authguard = require("../services/authguard")
const { PrismaClient } = require('@prisma/client');
const hashPasswordExtension = require("../services/hashPasswordExtensions");
const prisma = new PrismaClient().$extends(hashPasswordExtension);

// Route qui rend mon formulaire d'inscription pour company : 
companyRouter.get('/register', (req, res) => {
    res.render('pages/registerCompany.twig', {
        title: "Company-On - Register"
    })
})


// Création d'une nouvelle entreprise  dans la bdd lors de l'inscription
companyRouter.post('/register', async (req, res) => {
    try {
        const company = await prisma.company.create({
            data: {
                name: req.body.name,
                siret: req.body.siret,
                email: req.body.email,
                password: req.body.password
            }

        })
        res.redirect('/login')
    } catch (error) {
        res.render('pages/registerCompany.twig', {
            error,
            title: "Company-On - Register"
        })
    }
})

// Affichage de ma page login
companyRouter.get('/login', (req, res) => {
    res.render('pages/loginCompany.twig', {
        title: "Company-On - Log In"
    })
})


//Connection de la company et redirection vers le dashboard
companyRouter.post('/login', async (req, res) => {

    try {
        const company = await prisma.company.findFirst({
            where: {
                OR: [
                    { email: req.body.identifiant },
                    { siret: req.body.identifiant }
                ]
            }
        })
        if (company) {

            if (await bcrypt.compare(req.body.password, company.password)) {
                req.session.company = company
                res.redirect('/')
            }
            else {
                throw { error: { password: "Incorrect password. Please try again." } };
            }
        } else {
            throw {
                error: { email: "This user is not registered" }
            }
        }
    } catch (error) {
        console.log(error);

        res.render('pages/loginCompany.twig', {
            title: "Company-On - Log In",
            error
        })
    }
})



//Affichage de ma main page le Dashboard '/'
companyRouter.get('/', authguard, async (req, res) => {
    // console.log(req.session.company);
    try {
        const company = await prisma.company.findUnique({
            where: {
                email: req.session.company.email
            },
            include: {
                employes: true,
                computers: true
            }
        })
        const withoutCpus = await prisma.employe.findMany({
            where: {
                cpuId: null
            }
        });

        const freeCpus = await prisma.computer.findMany({
            where: {
                employe: null
            }
        })

        // Exemple de requête pour récupérer les ordinateurs avec les employés associés
        const computers = await prisma.computer.findMany({
            include: {
                employe: true // Inclure les informations de l'employé associé
            }
        });


        res.render('pages/dashboardCompany.twig', {
            company: req.session.company,
            employes: company.employes,
            computers: computers,
            withoutCpus: withoutCpus,
            freeCpus: freeCpus
        })

    }

    catch (error) {
        console.log(error)
    }


})


// Deconnexion
companyRouter.get("/logout", authguard, (req, res) => {

    req.session.destroy()
    res.redirect("/login")
})



//Affichage de ma page addEmploye (manageEmploye.twig)
companyRouter.get('/manageEmploye', authguard, async (req, res) => {
    const freeCpus = await prisma.computer.findMany({
        where: {
            employe: null
        }
    })
    res.render('pages/manageEmploye.twig', {
        company: req.session.company,
        freeCpus: freeCpus
    }
    )
})



// CReation et ajout d'un Employe à la BDD
companyRouter.post('/addEmploye', authguard, async (req, res) => {
    try {
        const employee = await prisma.employe.create({
            data: {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                password: req.body.password,
                age: parseInt(req.body.age),
                gender: req.body.gender,
                companyId: req.session.company.id,
                cpuId: parseInt(req.body.cpuId)
            }
        })
        res.redirect('/')
    } catch (error) {
        console.log(error)
        res.render('pages/manageEmploye.twig', {
            error,
            title: "Company-On - Manage Employe"
        })
    }
})




//Suppression d'un Employe
companyRouter.get('/deleteEmployee/:id', authguard, async (req, res) => {
    try {
        const deleteEmploye = await prisma.employe.delete({
            where: {
                id: parseInt(req.params.id)
            }
        })
        console.log("employee is fired")
        res.redirect('/')
    } catch (error) {
        console.log(error);
        res.redirect('/')
    }
})




//Affichage de ma page AddComputer (manageComputer.twig)
companyRouter.get('/manageComputer', async (req, res) => {
    let company = req.session.company
    try {
        const employeesWithoutComputer = await prisma.employe.findMany({
            where: {
                cpuId: null
            }
        });

        res.render('pages/manageComputer.twig', {
            employees: employeesWithoutComputer, // Passer les employés à la vue
            company,
            employes: company.employes,
            computers: company.computers
        });

    } catch (error) {
        console.error(error);
        res.render('pages/manageComputer.twig', { error });
    }
});



//CREATION et ajout d'un CPU à la BDD
companyRouter.post('/addComputer', authguard, async (req, res) => {
    try {
        // Création de l'ordinateur
        const computer = await prisma.computer.create({
            data: {
                ref: req.body.ref,
                companyId: parseInt(req.session.company.id)
            }
        });

        // Si un employé est sélectionné, mettre à jour son cpuId
        if (req.body.employeId) {
            await prisma.employe.update({
                where: { id: parseInt(req.body.employeId) },
                data: { cpuId: computer.id }
            });
        }

        res.redirect('/');

    } catch (error) {
        console.log(error);
        res.render('pages/manageComputer.twig', {
            error,
            title: "Company-On - Manage Computer"
        });
    }
});




//Assignation d'un CPU à un Employe
companyRouter.post('/assignCputoEmploye/:id', authguard, async (req, res) => {

    try {
        const updatedEmploye = await prisma.employe.update({ // Correction de 'Update' à 'update'
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                cpuId: parseInt(req.body.cpuId) // Champ à mettre à jour
            }
        });
        // Avant d'assigner un ordinateur à un employé

        console.log(`Employee ${req.params.id} Updated successfully, CPU ${req.body.cpuId} is assigned`)
        res.redirect('/');
    } catch (error) {
        // Avant d'assigner un ordinateur à un employé
        console.log('Assigning CPU:', req.body.cpuId, 'to Employee:', req.params.employeId);
        console.log(error);
        res.redirect('/manageComputer')
    }
})



// Suppression d'un CPU
companyRouter.post('/deleteCpu/:id', authguard, async (req, res) => {
    try {
        const deletedCpu = await prisma.computer.delete({
            where: {
                id: parseInt(req.params.id)
            }
        })
        console.log("cpu is deleted successfully")
        res.redirect('/')
    } catch (error) {
        console.log(error);
        res.redirect('/')
    }
})



//Assignation d'un Employé à un CPU
companyRouter.post('/assignEmployetoCpu/:cpuId', authguard, async (req, res) => {
    try {
        const updatedEmploye = await prisma.employe.update({
            where: {
                id: parseInt(req.body.employeId)
            },
            data: {
                cpuId: parseInt(req.params.cpuId)
            }
        })
        console.log(`Employee Updated successfully, computer ${req.params.cpuId} is assigned to employe: ${req.body.employeId}`)
        res.redirect('/');
    } catch (error) {



        // Avant d'assigner un employé à un ordinateur
        console.log('Assigning Employee:', req.body.id, 'to CPU:', req.params.cpuId);

        res.redirect('/')
    }
})



// Retrait d'un CPU assigné à un Employé
companyRouter.get('/removeCpu/:id', authguard, async (req, res) => {
    try {
        const removedCpufromEmploye = await prisma.employe.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                cpuId: null
            }
        })
        console.log(`Computer is removed successfully from Employe ${req.params.id}`)
        res.redirect('/')
    } catch (error) {
        console.log(error)
        res.redirect('/')
        console.log(`Can not remove Cpu from ${req.params.id}`);

    }
})


// Modification de l'employé
companyRouter.post('/updateEmployee/:id', authguard, async (req, res) => {
    try {
        const updatedEmploye = await prisma.employe.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                password: req.body.password,
                age: parseInt(req.body.age),
                gender: req.body.gender
            }
        })
        res.redirect('/')
    } catch (error) {
        console.log(error)
        res.redirect('/')
        console.log(`Can not update employe ${req.params.id}`);
    }

})



// Modification de la ref du CPU
companyRouter.post('/updateComputer/:id', authguard, async (req, res) => {

    try {
        const updatedCpu = await prisma.computer.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                ref: req.body.ref
            }

        })
        res.redirect('/')
        console.log(`Computer number ${req.params.id} updated Successfully, his ref is now ${req.body.ref}`)
    } catch (error) {

    }
})



// Retrait de l'employé assigné à un CPU
companyRouter.get('/removeEmployeeFromCpu/:id', authguard, async (req, res) => {
    try {
        const updatedCpu = await prisma.employe.update({
            where: {
                id: parseInt(req.params.id)
            },


            data: {
                cpuId: null
            }
        })
        res.redirect('/')
    } catch (error) {

    }
})



//Redirection vers ma page agenda rendant company et les employés qui ont un ordi
companyRouter.get('/agenda', authguard, async (req, res) => {
    try {
        const company = await prisma.company.findUnique({
            where: {
                email: req.session.company.email
            },
            include: {
                employes: {
                    //je veux que mes employés qui ont un ordi
                    where: {

                        cpuId: {
                            not: null
                        }
                    }
                },
                tasks: true
            }

        })
        res.render('pages/agenda.twig', {
            company
        })
    } catch (error) {
        console.log(error)
        res.redirect('/')
    }
})



// envoie d'une nouvelle taches assigné a un ou des employé et redirection vers '/'
companyRouter.post('/sendTask', async (req, res) => {
    const { taskTitle, task, startDate, endDate, startTime, endTime, employees } = req.body;

    try {
        // Création de la nouvelle tâche
        const newTask = await prisma.task.create({
            data: {
                taskTitle,
                description: task,
                startDate: new Date(`${startDate}T${startTime}`),
                endDate: new Date(`${endDate}T${endTime}`),
                assignedTo: {
                    connect: employees.map(id => ({ id: parseInt(id) })) // Assignation aux employés sélectionnés
                },
                companyId: req.session.company.id // Associer la tâche à l'entreprise
            }
        });

        res.redirect('/'); // Redirection vers l'agenda après création
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating task");
    }
});


companyRouter.get('/tasks/:id', async (req, res) => {
    const employeeId = parseInt(req.params.id);
    try {
        const tasks = await prisma.task.findMany({
            where: {
                assignedTo: {
                    some: {
                        id: employeeId
                    }
                }
            }
        });
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving tasks");
    }
});



module.exports = companyRouter


