import Card from "../ui/Card";
import Skeleton from "../ui/Skeleton";

function AppointmentsSkeleton({ count = 6 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <Skeleton height={16} width="45%" />
          <div style={{ height: 8 }} />
          <Skeleton height={14} width="55%" />
          <div style={{ height: 8 }} />
          <Skeleton height={14} width="25%" />
          <div style={{ height: 12 }} />
          <Skeleton height={34} width="120px" />
        </Card>
      ))}
    </div>
  );
}

export default AppointmentsSkeleton;
