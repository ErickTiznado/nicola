export const route = `

import {getAllUsers, addNewUser} from "../controllers/user.controller.js"
import { Remote } from "nicola-framework"

const RemoteRouter = new Remote()

RemoteRouter.get('/', getAllUsers);
RemoteRouter.post('/add-user', addNewUser);

export default RemoteRouter;
`