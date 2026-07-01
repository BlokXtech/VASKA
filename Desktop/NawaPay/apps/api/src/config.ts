import dotenv from "dotenv";

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4100),
  mongoUri: process.env.MONGO_URI ?? "mongodb://localhost:27017/nawapay",
  sqlUri: process.env.SQL_URI ?? "postgres://nawapay:nawapay@localhost:5432/nawapay",
  jwtSecret: process.env.JWT_SECRET ?? "local-development-secret",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  providerKeys: {
    electricity: process.env.ELECTRICITY_PROVIDER_API_KEY ?? "mock-electricity-key",
    mtc: process.env.MTC_PROVIDER_API_KEY ?? "mock-mtc-key",
    telecom: process.env.TELECOM_PROVIDER_API_KEY ?? "mock-telecom-key",
    castlebet: process.env.CASTLEBET_PROVIDER_API_KEY ?? "mock-castlebet-key",
    jsb: process.env.JSB_PROVIDER_API_KEY ?? "mock-jsb-key"
  }
};
