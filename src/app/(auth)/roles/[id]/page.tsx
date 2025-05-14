import EditRoleClientPage from "./client-page";

export default async function EditRolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditRoleClientPage id={id} />;
} 
