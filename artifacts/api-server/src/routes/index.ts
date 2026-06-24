import { Router, type IRouter } from "express";
import healthRouter from "./health";
import societiesRouter from "./societies";
import businessesRouter from "./businesses";
import leadsRouter from "./leads";
import reviewsRouter from "./reviews";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(societiesRouter);
router.use(businessesRouter);
router.use(leadsRouter);
router.use(reviewsRouter);
router.use(adminRouter);

export default router;
