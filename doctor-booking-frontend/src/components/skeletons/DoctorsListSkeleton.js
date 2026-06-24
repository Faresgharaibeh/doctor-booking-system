import Card from "../ui/Card";
import Skeleton from "../ui/Skeleton";

function DoctorsListSkeleton({ count = 6 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <Skeleton height={16} width="55%" />
          <div style={{ height: 8 }} />
          <Skeleton height={14} width="35%" />
          <div style={{ height: 12 }} />
          <Skeleton height={34} width="140px" />
        </Card>
      ))}
    </div>
  );
}

export default DoctorsListSkeleton;
