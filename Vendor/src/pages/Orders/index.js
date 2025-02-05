import React, { useEffect, useState } from "react";
import { Button, Dialog, Pagination } from "@mui/material";
import { fetchDataFromApi, editData } from "../../utils/api";
import { MdClose } from "react-icons/md";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [isOpenModal, setIsOpenModal] = useState(false);
  // Parse user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const sellerId = user?.userId; // Use userId from user object

  useEffect(() => {
    fetchDataFromApi(`/api/orders/seller/${sellerId}?page=1&perPage=50`).then(
      (res) => {
        setOrders(res);
      }
    );
  }, [sellerId]);

  const handleChange = (event, value) => {
    setPage(value);
    fetchDataFromApi(
      `/api/orders/seller/${sellerId}?page=${value}&perPage=50`
    ).then((res) => {
      setOrders(res);
    });
  };

  const showProducts = (id) => {
    fetchDataFromApi(`/api/orders/${id}`).then((res) => {
      setIsOpenModal(true);
      setProducts(res.products);
    });
  };

  const orderStatus = (orderStatus, id) => {
    fetchDataFromApi(`/api/orders/${id}`).then((res) => {
      const order = {
        ...res,
        status: orderStatus,
      };
      editData(`/api/orders/${id}`, order).then(() => {
        fetchDataFromApi(
          `/api/orders/seller/${sellerId}?page=1&perPage=50`
        ).then((res) => {
          setOrders(res);
        });
      });
    });
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
        <h5 className="mb-0">My Orders</h5>
      </div>

      <div className="table-responsive mt-3">
        <table className="table table-border v-align">
          <thead className="thead-dark">
            <tr>
              <th style={{ textAlign: "center" }}>Payment Id</th>
              <th style={{ textAlign: "center" }}>Products</th>
              <th style={{ width: "100px", textAlign: "center" }}>Name</th>
              <th style={{ textAlign: "center" }}>Phone number</th>
              <th style={{ textAlign: "center" }}>Address</th>
              <th style={{ textAlign: "center" }}>Pincode</th>
              <th style={{ textAlign: "center" }}>Total Amount</th>
              <th style={{ textAlign: "center" }}>Email</th>
              <th style={{ textAlign: "center" }}>Order Status</th>
              <th style={{ textAlign: "center" }}>Date</th>
            </tr>
          </thead>

          <tbody>
            {orders?.orderList?.length !== 0 &&
              orders?.orderList?.map((order) => (
                <tr key={order._id}>
                  <td>
                    <span className="text-blue font-weight-bold">
                      {order?.paymentId}
                    </span>
                  </td>
                  <td>
                    <span
                      className="viewbtn text-blue font-weight-bold cursor-pointer"
                      onClick={() => showProducts(order._id)}
                    >
                      Click here to view
                    </span>
                  </td>
                  <td>{order?.name}</td>
                  <td>{order?.phone}</td>
                  <td>{order?.address}</td>
                  <td>{order?.pinCode}</td>
                  <td>{order?.amount}</td>
                  <td>{order?.email}</td>
                  <td>
                    {order?.status === "Pending" ? (
                      <span
                        className="badge badge-danger"
                        onClick={() => orderStatus("confirm", order?._id)}
                        style={{ color: "#fff" }}
                      >
                        {order?.status}
                      </span>
                    ) : (
                      <span
                        className="badge badge-success"
                        onClick={() => orderStatus("pending", order?._id)}
                        style={{ color: "#fff" }}
                      >
                        {order?.status}
                      </span>
                    )}
                  </td>
                  <td>{order?.date}</td>
                </tr>
              ))}
          </tbody>
        </table>
        {orders?.totalPages > 1 && (
          <Pagination
            count={orders?.totalPages}
            color="primary"
            className="pagination"
            showFirstButton
            showLastButton
            onChange={handleChange}
          />
        )}
      </div>
      <Dialog open={isOpenModal} className="productModal dialogproduct">
        <div className="d-flex align-items-center justify-content-between mb-3 p-1">
          <h4 className="font-weight-bold pr-5">Products</h4>
          <Button className="close" onClick={() => setIsOpenModal(false)}>
            <MdClose />
          </Button>
        </div>
        <div className="table-responsive orderTable">
          <table className="table table-bordered v-align table-striped">
            <thead className="thead-dark">
              <tr>
                <th style={{ textAlign: "center" }}>Product Id</th>
                <th style={{ textAlign: "center" }}>Product Title</th>
                <th style={{ textAlign: "center" }}>Product Image</th>
                <th style={{ textAlign: "center" }}>Quantity</th>
                <th style={{ textAlign: "center" }}>Price</th>
                <th style={{ textAlign: "center" }}>SubTotal</th>
              </tr>
            </thead>
            <tbody>
              {products?.length !== 0 &&
                products?.map((product) => (
                  <tr key={product?._id}>
                    <td>{product?._id}</td>
                    <td>{product?.productName}</td>
                    <td>
                      <div className="img">
                        <img src={product?.image} alt="" />
                      </div>
                    </td>
                    <td>{product?.quantity}</td>
                    <td>{product?.price}</td>
                    <td>{product?.total}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Dialog>
    </div>
  );
};

export default Orders;
