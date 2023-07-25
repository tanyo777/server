const envConfig = {
  port: Number(process.env.PORT),
  secrets: [process.env.REACT_CLIENTS_SECRET, process.env.NODE_CLIENTS_SECRET],
};

export default envConfig;
