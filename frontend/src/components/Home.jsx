import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MetaData from "./layouts/MetaData";
import { getProducts } from "../redux/Actions/productsActions";
import Loader from "./layouts/Loader";
import Product from "./product/Product";
import { toast, Slide } from "react-toastify";
import Pagination from "react-js-pagination";

const Home = () => {
  const dispatch = useDispatch();
  const { products, loading, error, productCount, resPerPage } = useSelector(
    (state) => state.productsState
  );
  const [currentPage, setCurrentPage] = useState(1);

  const setCurrentPageNo = (pageNo) => {
    setCurrentPage(pageNo);
  };

  useEffect(() => {
    if (error) {
      return toast.error(error, {
        position: "bottom-center",
        theme: "colored",
        transition: Slide,
      });
    }

    dispatch(getProducts(null,currentPage));
  }, [error, dispatch, currentPage]);

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title={"Buy Best Products"} />
          <h1 id="products_heading">Latest Products</h1>

          <section id="products" className="container mt-5">
            <div className="row">
              {products &&
                products.map((product) => (
                  <div
                    key={product._id}
                    className="col-sm-12 col-md-6 col-lg-3 my-3"
                  >
                    <Product product={product} />
                  </div>
                ))}
            </div>
          </section>

          <div className="d-flex justify-content-center mt-5">
            {productCount > 0 && productCount > resPerPage ? (
              <Pagination
                activePage={currentPage}
                itemsCountPerPage={resPerPage}
                totalItemsCount={productCount}
                pageRangeDisplayed={5}
                onChange={setCurrentPageNo}
                nextPageText={"Next"}
                firstPageText={"First"}
                lastPageText={"last"}
                itemClass={"page-item"}
                linkClass={"page-link"}
              />
            ) : null}
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default Home;
