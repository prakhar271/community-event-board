import React from 'react';

// Base skeleton component
const Skeleton: React.FC<{ 
  width?: string; 
  height?: string; 
  className?: string;
  rounded?: boolean;
}> = ({ width = '100%', height = '1rem', className = '', rounded = false }) => (
  <div 
    className={`skeleton ${rounded ? 'skeleton-rounded' : ''} ${className}`}
    style={{ width, height }}
  />
);

// Event card skeleton
export const EventCardSkeleton: React.FC = () => (
  <div className="event-card-skeleton">
    <Skeleton height="200px" rounded className="mb-4" />
    <Skeleton width="80%" height="1.5rem" className="mb-2" />
    <Skeleton width="60%" height="1rem" className="mb-2" />
    <Skeleton width="40%" height="1rem" className="mb-4" />
    <div className="flex justify-between items-center">
      <Skeleton width="30%" height="1rem" />
      <Skeleton width="20%" height="2rem" rounded />
    </div>
  </div>
);

// Event list skeleton
export const EventListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="event-list-skeleton">
    {Array.from({ length: count }, (_, i) => (
      <EventCardSkeleton key={i} />
    ))}
  </div>
);

// User profile skeleton
export const UserProfileSkeleton: React.FC = () => (
  <div className="user-profile-skeleton">
    <div className="flex items-center mb-6">
      <Skeleton width="80px" height="80px" rounded className="mr-4" />
      <div className="flex-1">
        <Skeleton width="60%" height="1.5rem" className="mb-2" />
        <Skeleton width="40%" height="1rem" />
      </div>
    </div>
    <div className="space-y-4">
      <Skeleton height="1rem" />
      <Skeleton width="80%" height="1rem" />
      <Skeleton width="90%" height="1rem" />
    </div>
  </div>
);

// Dashboard skeleton
export const DashboardSkeleton: React.FC = () => (
  <div className="dashboard-skeleton">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="stat-card-skeleton">
          <Skeleton width="40%" height="1rem" className="mb-2" />
          <Skeleton width="60%" height="2rem" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <Skeleton width="50%" height="1.5rem" className="mb-4" />
        <EventListSkeleton count={3} />
      </div>
      <div>
        <Skeleton width="50%" height="1.5rem" className="mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center">
              <Skeleton width="40px" height="40px" rounded className="mr-3" />
              <div className="flex-1">
                <Skeleton width="70%" height="1rem" className="mb-1" />
                <Skeleton width="50%" height="0.8rem" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Form skeleton
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 5 }) => (
  <div className="form-skeleton space-y-4">
    {Array.from({ length: fields }, (_, i) => (
      <div key={i}>
        <Skeleton width="30%" height="1rem" className="mb-2" />
        <Skeleton height="2.5rem" />
      </div>
    ))}
    <Skeleton width="40%" height="2.5rem" className="mt-6" />
  </div>
);

// Table skeleton
export const TableSkeleton: React.FC<{ 
  rows?: number; 
  columns?: number; 
}> = ({ rows = 5, columns = 4 }) => (
  <div className="table-skeleton">
    <div className="table-header mb-4">
      <div className="flex space-x-4">
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} width="20%" height="1rem" />
        ))}
      </div>
    </div>
    <div className="table-body space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: columns }, (_, j) => (
            <Skeleton key={j} width="20%" height="1rem" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Page skeleton wrapper
export const PageSkeleton: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="page-skeleton animate-pulse">
    {children}
  </div>
);

// CSS styles (add to your global CSS)
export const skeletonStyles = `
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-rounded {
  border-radius: 50%;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.event-card-skeleton,
.stat-card-skeleton {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.user-profile-skeleton,
.form-skeleton,
.table-skeleton {
  padding: 1.5rem;
}
`;