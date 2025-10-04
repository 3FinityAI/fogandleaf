import { ChevronLeft, ChevronRight } from "lucide-react";

const OrdersPagination = ({ pagination, onPageChange }) => {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {(pagination.currentPage - 1) * 10 + 1} to{" "}
          {Math.min(pagination.currentPage * 10, pagination.totalOrders)} of{" "}
          {pagination.totalOrders} orders
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-1">
            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
              const pageNum = Math.max(1, pagination.currentPage - 2) + i;
              if (pageNum > pagination.totalPages) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-2 text-sm rounded-lg ${
                    pagination.currentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersPagination;
