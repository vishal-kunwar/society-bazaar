import { Router, type IRouter } from "express";
import healthRouter from "./health";
import societiesRouter from "./societies";
import businessesRouter from "./businesses";
import leadsRouter from "./leads";
import reviewsRouter from "./reviews";
import adminRouter from "./admin";
import feedRouter from "./feed";
import dealsRouter from "./deals";
import favouritesRouter from "./favourites";
import analyticsRouter from "./analytics";
import productsRouter from "./products";

const router: IRouter = Router();

router.use(healthRouter);
router.use(societiesRouter);
router.use(productsRouter);
router.use(businessesRouter);
router.use(leadsRouter);
router.use(reviewsRouter);
router.use(adminRouter);
router.use(feedRouter);
router.use(dealsRouter);
router.use(favouritesRouter);
router.use(analyticsRouter);

export default router;
