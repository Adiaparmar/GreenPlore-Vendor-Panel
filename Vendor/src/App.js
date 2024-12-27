/* eslint-disable react-hooks/exhaustive-deps */
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Dashboard from "./pages/Dashboard/index.js";
import Header from "./components/Header/index.js";
import Sidebar from "./components/Sidebar/index.js";
import { createContext, useEffect, useState } from "react";
import Login from "./pages/Login/index.js";
import SignUp from "./pages/SignUp/index.js";
import Product from "./pages/Products/index.js";
import ProductDetails from "./pages/ProductDetails/index.js";
import ProductUpload from "./pages/Products/addProduct.js";
import EditProduct from "./pages/Products/editProduct.js";
import CategoryAdd from "./pages/Category/addCategory.js";
import EditCategory from "./pages/Category/editCategory.js";
import EditSubCategory from "./pages/Category/editSubCat.js";
import Category from "./pages/Category/categoryList.js";
import { fetchDataFromApi } from "./utils/api.js";
import SubCatAdd from "./pages/Category/addSubCat.js";
import SubCatList from "./pages/Category/subCategoryList.js";
import Orders from "./pages/Orders/index.js";

const MyContext = createContext();

function App() {
  const [isToggleSidebar, setIsToggleSidebar] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [catData, setCatData] = useState([]);
  const [subCatData, setSubCatData] = useState([]);
  const [user, setUser] = useState({
    name: "",
    email: "",
    userId: "",
  });
  const [isHideSidebarAndHeader, setisHideSidebarAndHeader] = useState(false);
  const [themeMode, setThemeMode] = useState(true);
  const [baseUrl, setBaseUrl] = useState("http://localhost:4000/");

  useEffect(() => {
    if (themeMode === true) {
      document.body.classList.remove("dark");
      document.body.classList.add("light");
      localStorage.setItem("themeMode", "light");
    } else {
      document.body.classList.remove("light");
      document.body.classList.add("dark");
      localStorage.setItem("themeMode", "dark");
    }
  }, [themeMode]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token !== null && token !== "") {
      setIsLogin(true);
      const userData = JSON.parse(localStorage.getItem("user"));

      setUser(userData);
    } else {
      setIsLogin(false);
    }
  }, [isLogin]);

  useEffect(() => {
    fetchCategory();
    fetchSubCategory();
  }, []);

  const fetchCategory = async () => {
    fetchDataFromApi("/api/category").then((res) => {
      setCatData(res);
    });
  };

  const fetchSubCategory = async () => {
    fetchDataFromApi("/api/subCat").then((res) => {
      setSubCatData(res);
    });
  };

  const values = {
    isToggleSidebar,
    setIsToggleSidebar,
    isLogin,
    setIsLogin,
    isHideSidebarAndHeader,
    setisHideSidebarAndHeader,
    themeMode,
    setThemeMode,
    baseUrl,
    setBaseUrl,
    catData,
    fetchCategory,
    subCatData,
    fetchSubCategory,
    user,
    setUser,
  };

  return (
    <BrowserRouter>
      <MyContext.Provider value={values}>
        {isHideSidebarAndHeader !== true && <Header />}
        <div className="main d-flex">
          {isHideSidebarAndHeader !== true && (
            <div
              className={`sidebarWrapper ${
                isToggleSidebar === true ? "toggle" : ""
              }`}
            >
              <Sidebar />
            </div>
          )}

          <div
            className={`content ${isHideSidebarAndHeader === true && "full"} ${
              isToggleSidebar === true ? "toggle" : ""
            }`}
          >
            <Routes>
              <Route path="/" exact={true} element={<Dashboard />} />
              <Route path="/dashboard" exact={true} element={<Dashboard />} />
              <Route path="/login" exact={true} element={<Login />} />
              <Route path="/signUp" exact={true} element={<SignUp />} />
              <Route path="/products" exact={true} element={<Product />} />
              <Route
                path="/category/add"
                exact={true}
                element={<CategoryAdd />}
              />
              <Route
                path="/subCategory/add"
                exact={true}
                element={<SubCatAdd />}
              />
              <Route
                path="/subCategory/"
                exact={true}
                element={<SubCatList />}
              />
              <Route
                path="/category/edit/:id"
                exact={true}
                element={<EditCategory />}
              />
              <Route
                path="/subCategory/edit/:id"
                exact={true}
                element={<EditSubCategory />}
              />
              <Route path="/categories" exact={true} element={<Category />} />

              <Route
                path="/product/details/:id"
                exact={true}
                element={<ProductDetails />}
              />
              <Route
                path="/product/upload"
                exact={true}
                element={<ProductUpload />}
              />
              <Route
                path="/product/edit/:id"
                exact={true}
                element={<EditProduct />}
              />
              <Route path="/orders" exact={true} element={<Orders />} />
            </Routes>
          </div>
        </div>
      </MyContext.Provider>
    </BrowserRouter>
  );
}

export default App;
export { MyContext };
