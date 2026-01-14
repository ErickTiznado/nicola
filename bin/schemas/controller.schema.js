export const controller =`

let users = [
    {
        "id":1,
        "nombre": 'Erick Tiznado'
    },
    {
        "id":2,
        "nombre": 'Jane Doe'
    }
];

const getAllUsers = (req, res) =>{
    res.json(users)
}

const addNewUser = (req, res) => {
    const {user} = req.body;

    users.push(user);

    res.json({
        message: "Usuario registrado con exito",
        status: true
    })
}



export {
    getAllUsers,
    addNewUser
}
    `