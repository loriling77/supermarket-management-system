
import { Routes, Route } from 'react-router-dom'
import Login from './pages/login'
import Register from './pages/register'
import Home from './pages/home'
import User from './pages/user'
import Category from './pages/category'
import Manufacture from './pages/manufacture'
import UserOrder from './pages/userOrder'


function App() {


    return (
        <>
            <Routes>
                <Route
                    path='/' element={<Login></Login>}>

                </Route>
                <Route
                    path='/register' element={<Register></Register>}>

                </Route>
                <Route
                    path='/login' element={<Login></Login>} >

                </Route>
                <Route
                    path='/home' element={<Home></Home>}>

                </Route>
                <Route
                    path='/user' element={<User></User>}>

                </Route>
                <Route
                    path='/category' element={<Category></Category>}>

                </Route>
                <Route
                    path='/manufacture' element={<Manufacture></Manufacture>}>

                </Route>
                <Route
                    path='/userOrder' element={<UserOrder></UserOrder>}>

                </Route>

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/admin" element={<Home />} />


            </Routes>

        </>
    )
}

export default App
