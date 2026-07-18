import {
  getSettingsController,
  updateSettingsController
} from "@modules/settings/controller/settings-controller";

export const runtime = "nodejs";

export async function GET() {
  return getSettingsController();
}

export async function PUT(request: Request) {
  return updateSettingsController(request);
}
