const notFound = (_req, res) => {
  res.status(404).json({ message: "Route not found" });
};

const errorHandler = (err, _req, res, _next) => {
  res.status(err.status || 500).json({
    message: err.message || "Server Error"
  });
};

export { notFound, errorHandler };
