import { ComingSoon } from "~/components/coming-soon";

export default function LogsPage() {
  return (
    <div className="flex h-screen w-full">
      <ComingSoon 
        title="Coming Soon"
        description="The logs functionality is currently under development. You will be able to view system logs and activity history here."
      />
    </div>
  );
}
