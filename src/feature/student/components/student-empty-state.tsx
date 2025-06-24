import { memo } from "react";
import { Users, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface StudentEmptyStateProps {
    searchTerm?: string | undefined;
    hasFilters?: boolean;
    onClearSearch?: () => void;
    onClearFilters?: () => void;
}

export const StudentEmptyState = memo(({ 
    searchTerm, 
    hasFilters, 
    onClearSearch, 
    onClearFilters 
}: StudentEmptyStateProps) => {
    const hasSearchOrFilters = searchTerm || hasFilters;

    return (
        <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                
                <h3 className="text-lg font-semibold mb-2">
                    {hasSearchOrFilters ? "Không tìm thấy học sinh" : "Chưa có học sinh nào"}
                </h3>
                
                <p className="text-muted-foreground text-center mb-6 max-w-sm">
                    {hasSearchOrFilters 
                        ? "Không có học sinh nào phù hợp với tiêu chí tìm kiếm của bạn. Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm."
                        : "Bắt đầu bằng cách thêm học sinh đầu tiên vào hệ thống."
                    }
                </p>

                {hasSearchOrFilters && (
                    <div className="flex gap-2">
                        {searchTerm && onClearSearch && (
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={onClearSearch}
                                className="flex items-center gap-2"
                            >
                                <Search className="h-4 w-4" />
                                Xóa tìm kiếm
                            </Button>
                        )}
                        {hasFilters && onClearFilters && (
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={onClearFilters}
                                className="flex items-center gap-2"
                            >
                                <Filter className="h-4 w-4" />
                                Xóa bộ lọc
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
});

StudentEmptyState.displayName = "StudentEmptyState"; 