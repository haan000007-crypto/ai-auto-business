import { Module } from "@nestjs/common";
import { WorkflowsController } from "./workflows.controller.js";

@Module({ controllers: [WorkflowsController] })
export class WorkflowsModule {}
