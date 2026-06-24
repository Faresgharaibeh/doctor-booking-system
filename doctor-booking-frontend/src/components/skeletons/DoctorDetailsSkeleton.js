import Card from "../ui/Card";
import Skeleton from "../ui/Skeleton";

function DoctorDetailsSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Card>
        <Skeleton height={18} width="40%" />
        <div style={{ height: 8 }} />
        <Skeleton height={14} width="30%" />
      </Card>

      <Card>
        <Skeleton height={14} width="20%" />
        <div style={{ height: 10 }} />
        <Skeleton height={36} width="220px" />
      </Card>

      <Card>
        <Skeleton height={14} width="30%" />
        <div style={{ height: 10 }} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} height={34} width="88px" />
          ))}
        </div>
        <div style={{ height: 12 }} />
        <Skeleton height={36} width="180px" />
      </Card>
    </div>
  );
}

export default DoctorDetailsSkeleton;
