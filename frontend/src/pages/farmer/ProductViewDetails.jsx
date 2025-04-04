import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { showProductDetails } from '../../redux/slices/productSlice'
import { useParams } from 'react-router-dom'

function ProductViewDetails() {
  const {productId} = useParams()
  const dispatch = useDispatch()
  const { selectedProduct, bidDetails } = useSelector((state)=>{
    return state.products;
  })

  console.log("product Id in product details page : ", productId)
  useEffect(()=>{
    if(productId){
        dispatch(showProductDetails(productId))
    }
  },[productId,dispatch])
  return (
    <div className='min-h-screen p-6 bg-white'>
        <div className='flex justify-center items-center'>
        <div>
        <h2 className="text-xl font-bold">{selectedProduct?.productName}</h2>
            <p className="text-gray-500">Category: {selectedProduct?.category}</p>
            <p className="text-gray-500">Price: ₹{selectedProduct?.price}</p>
            <p className="text-gray-500">Description: {selectedProduct?.productDescription}</p>
    
            {/* Display Product Images */}
            {selectedProduct?.productImages?.length > 0 && (
              <div className="carousel w-full mt-4">
                {selectedProduct?.productImages?.map((image, index) => (
                  <div key={index} className="w-full h-[250px]">
                    <img
                      src={image?.url}
                      alt={`Product ${index}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
    
            {/* Bidding Details (if bidding has started) */}
            {bidDetails && (
              <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                <h3 className="text-lg font-bold">Bidding Information</h3>
                <p>Description : {bidDetails?.productDescription}</p>
                <p>Current Highest Bid: ₹{bidDetails?.currentHighestBid}</p>
                <p>Status: {bidDetails?.bidStatus}</p>
                {bidDetails?.winner && <p>Winner: {bidDetails?.winner?.name}</p>}
              </div>
            )}
            </div>
        </div>
    </div>
  )
}

export default ProductViewDetails