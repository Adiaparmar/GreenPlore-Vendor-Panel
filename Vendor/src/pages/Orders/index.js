import React, { useEffect, useState } from "react";
import { Button, Dialog, Pagination } from "@mui/material";
import { fetchDataFromApi, editData } from "../../utils/api";
import { MdClose } from "react-icons/md";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const sellerId = user?.userId;

  useEffect(() => {
    if (sellerId) {
      const fetchOrders = async () => {
        try {
          const response = await fetchDataFromApi(
            `/api/orders/seller/${sellerId}?page=${page}&perPage=50`
          );
          console.log("API Response:", response);
          setOrders(response);
        } catch (error) {
          console.error("Error fetching orders:", error);
          // Handle error appropriately (e.g., show error message to user)
        }
      };

      fetchOrders();
    }
  }, [sellerId, page]);
  const handleChange = (event, value) => {
    setPage(value);
  };

  const showProducts = (order) => {
    // Now we can just use the filtered products directly from the order
    setProducts(order.products);
    setIsOpenModal(true);
  };

  const orderStatus = (orderStatus, id) => {
    fetchDataFromApi(`/api/orders/${id}`).then((res) => {
      const order = {
        ...res,
        status: orderStatus,
      };
      editData(`/api/orders/${id}`, order).then(() => {
        fetchDataFromApi(
          `/api/orders/seller/${sellerId}?page=${page}&perPage=50`
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
              <th style={{ textAlign: "center" }}>Name</th>
              <th style={{ textAlign: "center" }}>Phone number</th>
              <th style={{ textAlign: "center" }}>Address</th>
              <th style={{ textAlign: "center" }}>Pincode</th>
              <th style={{ textAlign: "center" }}>My Products Total</th>
              <th style={{ textAlign: "center" }}>Email</th>
              <th style={{ textAlign: "center" }}>Order Status</th>
              <th style={{ textAlign: "center" }}>Date</th>
            </tr>
          </thead>

          <tbody>
            {orders?.orderList?.map((order) => (
              <tr key={order._id}>
                <td>
                  <span className="text-blue font-weight-bold">
                    {order?.paymentId}
                  </span>
                </td>
                <td>
                  <span
                    className="viewbtn text-blue font-weight-bold cursor-pointer"
                    onClick={() => showProducts(order)}
                  >
                    Click here to view
                  </span>
                </td>
                <td>{order?.name}</td>
                <td>{order?.phone}</td>
                <td>{order?.address}</td>
                <td>{order?.pinCode}</td>
                <td>{order?.sellerAmount}</td>
                <td>{order?.email}</td>
                <td>
                  <span
                    className={`badge badge-${
                      order?.status === "pending" ? "danger" : "success"
                    }`}
                    onClick={() =>
                      orderStatus(
                        order?.status === "pending" ? "confirm" : "pending",
                        order?._id
                      )
                    }
                    style={{ color: "#fff", cursor: "pointer" }}
                  >
                    {order?.status}
                  </span>
                </td>
                <td>{new Date(order?.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders?.totalPages > 1 && (
          <Pagination
            count={orders?.totalPages}
            page={page}
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
          <h4 className="font-weight-bold pr-5">My Products in This Order</h4>
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
              {products?.map((product) => (
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
