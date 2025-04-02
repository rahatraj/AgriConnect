const parseFormData = (req, res, next) => {
    if (req.body.address) {
      try {
        console.log("middle ware hits")
        req.body.address = JSON.parse(req.body.address)
      } catch (error) {
        return res.status(400).json({ message: "Invalid address format" });
      }
    }
    console.log(req.body)
    next();
  };
export default parseFormData;