import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [keyword, setKeyword] = useState("");

  const SearchHandler = (e) => {
    e.preventDefault();
    navigate(`/search/${keyword}`);
  };

  const clearKeyword = () => {
    setKeyword("");
  };

  useEffect(() => {
    if (location.pathname == "/") {
      clearKeyword();
    }
  }, [location]);

  return (
    <form onSubmit={SearchHandler}>
      <div className="input-group d-flex align-items-center">
        <input
          type="text"
          id="search_field"
          className="form-control"
          placeholder="Enter Product Name ..."
          onChange={(e) => {
            setKeyword(e.target.value);
          }}
          value={keyword}
        />
        <button id="search_btn" className="btn ml-2">
          <i className="fa fa-search" aria-hidden="true"></i>
        </button>
      </div>
    </form>
  );
};

export default Search;
