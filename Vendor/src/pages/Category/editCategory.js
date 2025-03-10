/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { emphasize, styled } from "@mui/material/styles";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import { Button } from "@mui/material";
import { FaCloudUploadAlt, FaRegImages } from "react-icons/fa";
import { useContext, useEffect, useState } from "react";
import { editData, fetchDataFromApi, postData } from "../../utils/api";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import { Link, useParams } from "react-router-dom";
import { MyContext } from "../../App";

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === "light"
      ? theme.palette.grey[100]
      : theme.palette.grey[800];
  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    "&:hover, &:focus": {
      backgroundColor: emphasize(backgroundColor, 0.06),
    },
    "&:active": {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12),
    },
  };
});

const EditCategory = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [formFields, setFormFields] = useState({
    name: "",
    images: [],
    color: "",
  });

  // eslint-disable-next-line no-unused-vars
  const [category, setCategory] = useState({});
  const [files, setFiles] = useState([]);
  const [imgFiles, setimgFiles] = useState();
  const [previews, setPreviews] = useState();
  const [isSelectedImages, setIsSelectedImages] = useState(false);
  const [isSelectedFiles, setIsSelectedFiles] = useState(false);

  const { id } = useParams();
  const context = useContext(MyContext);
  const formdata = new FormData();
  useEffect(() => {
    if (!imgFiles) return;
    let tmp = [];
    for (let i = 0; i < imgFiles.length; i++) {
      tmp.push(URL.createObjectURL(imgFiles[i]));
    }

    const objectUrls = tmp;
    setPreviews(objectUrls);

    //free memory
    for (let i = 0; i < imgFiles.length; i++) {
      return () => {
        URL.revokeObjectURL(objectUrls[i]);
      };
    }
  }, [imgFiles]);

  useEffect(() => {
    fetchDataFromApi(`/api/category/${id}`).then((res) => {
      setCategory(res);
      setFormFields({
        name: res.name,
        subCat: res.subCat,
        color: res.color,
      });
      setPreviews(res.images);
    });
  }, []);

  const onChangeFile = (e, apiEndPoint) => {
    try {
      const imgArr = [];
      const files = e.target.files;

      for (let i = 0; i < files.length; i++) {
        if (
          files[i] &&
          (files[i].type === "image/jpeg" ||
            files[i].type === "image/jpg" ||
            files[i].type === "image/png")
        ) {
          setimgFiles(files);

          const file = files[i];
          imgArr.push(file);
          formdata.append("images", file);

          setFiles(imgArr);

          setIsSelectedFiles(true);

          postData(apiEndPoint, formdata).then((res) => {
            alert("Image uploaded successfully");

            // Update previews with new images
            const newPreviews = res.map(
              (img) => `${context.baseUrl}uploads/${img}`
            );
            setPreviews(newPreviews);
          });
        } else {
          alert("Please upload only image files");
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const changeInput = (e) => {
    setFormFields(() => ({
      ...formFields,
      [e.target.name]: e.target.value,
    }));
  };

  const history = useNavigate();

  // const editCategory = (e) => {
  //   e.preventDefault();
  //   formdata.append("name", formFields.name);
  //   formdata.append("color", formFields.color);

  //   if (formFields.name !== "" && formFields.color !== "") {
  //     setIsLoading(true);
  //     editData(`/api/category/${id}`, formFields).then((res) => {
  //       setIsLoading(false);
  //       history("/categories");
  //     });
  //   } else {
  //     setError(true);
  //   }
  // };

  const editCategory = (e) => {
    e.preventDefault();
    formdata.append("name", formFields.name);
    formdata.append("subCat", formFields.subCat);
    formdata.append("color", formFields.color);

    if (files.length > 0) {
      files.forEach((file) => {
        formdata.append("images", file); // Append each image file
      });
    }

    if (formFields.name !== "" && formFields.color !== "") {
      setIsLoading(true);
      editData(`/api/category/${id}`, formdata).then((res) => {
        setIsLoading(false);
        history("/categories");
      });
    } else {
      setError(true);
    }
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 w-100 flex-row p-4 justify-content-between">
        <h5 className="mb-0 breadhead">Edit Category</h5>
        <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
          <StyledBreadcrumb
            components="a"
            href="#"
            label="Dashboard"
            icon={<HomeIcon fontSize="small" />}
          />
          <StyledBreadcrumb label="Category" components="a" href="#" />
          <StyledBreadcrumb label="Edit Category" />
        </Breadcrumbs>
      </div>

      <form className="form" onSubmit={editCategory}>
        <div className="row">
          <div className="col-sm-9">
            <div className="card p-4">
              {error === true && (
                <p className="text-danger">Please fill all the fields </p>
              )}
              <div className="form-group">
                <h6>Category Name</h6>
                <input
                  type="text"
                  name="name"
                  value={formFields.name}
                  onChange={changeInput}
                />
              </div>

              <div className="form-group">
                <h6>Sub Category Name</h6>
                <input
                  type="text"
                  name="subCat"
                  value={formFields.subCat}
                  onChange={changeInput}
                />
              </div>

              <div className="form-group">
                <h6>Color</h6>
                <input
                  type="text"
                  name="color"
                  value={formFields.color}
                  onChange={changeInput}
                />
              </div>

              <div className="imagesUpploadSec">
                <h5 className="mb-4">Media and Published</h5>
                <div className="imgUploadBox d-flex align-items-center">
                  {previews?.length !== 0 &&
                    previews?.map((img, index) => {
                      return (
                        <div className="uploadBox" key={index}>
                          {isSelectedImages === true ? (
                            <img src={`${img}`} className="w-100 " />
                          ) : (
                            <img
                              src={`${context.baseUrl}uploads/${img}`}
                              className="w-100"
                            />
                          )}
                        </div>
                      );
                    })}
                  <div className="uploadBox">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => onChangeFile(e, "/api/category/upload")}
                      name="images"
                    />
                    <div className="info">
                      <FaRegImages />
                      <h5>Image Upload</h5>
                    </div>
                  </div>
                </div>

                <br />
                <Button type="submit" className="btn-blue btn-lg btn-big w-100">
                  <FaCloudUploadAlt /> &nbsp;{" "}
                  {isLoading === true ? (
                    <CircularProgress color="inherit" className="loader" />
                  ) : (
                    "PUBLISH AND VIEW"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditCategory;
