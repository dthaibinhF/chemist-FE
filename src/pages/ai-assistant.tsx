import AIChat from "@/feature/ai-assistant/components/AIChat";
import { useAuth } from "@/feature/auth/hooks/useAuth";

const AiAssistantPage = () => {
  const { account } = useAuth();

  // Tạo welcome message phù hợp với vai trò người dùng
  const getWelcomeMessage = () => {
    if (account) {
      return `Xin chào ${account.name}! Tôi là Junie, trợ lý AI của Chemist. Với vai trò ${account.role_name}, bạn có thể hỏi tôi về các thông tin liên quan đến hệ thống quản lý. Hãy hỏi tôi bất cứ điều gì bạn muốn biết!`;
    } else {
      return `Xin chào! Tôi là Junie, trợ lý AI của Chemist. Tôi có thể giúp bạn tìm hiểu về thông tin cơ bản như học phí, lịch học và các thông tin chung về trung tâm. Để truy cập thông tin chi tiết hơn, bạn có thể đăng nhập vào hệ thống. Hãy hỏi tôi bất cứ điều gì bạn muốn biết!`;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-bold mb-1">Junie - Trợ lý AI Chemist</h1>
        <p className="text-sm text-muted-foreground">
          Hỏi về thông tin học sinh, lịch học, điểm số và nhiều thông tin khác bằng ngôn ngữ tự nhiên
        </p>
        {!account && (
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            💡 Đăng nhập để truy cập thông tin chi tiết và dữ liệu cá nhân
          </p>
        )}
      </div>

      <AIChat
        height="70vh"
        welcomeMessage={getWelcomeMessage()}
        className="mx-auto max-w-4xl shadow-lg"
        userAccount={account}
      />
    </div>
  );
};

export default AiAssistantPage;
