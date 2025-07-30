import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/feature/auth/hooks/useAuth';
import { extractRoleName } from '@/utils/rbac-utils';

/**
 * Unauthorized Access Page
 * 
 * Simple page displayed when users try to access resources they don't have permission for.
 * Shows the "WHO ARE YOU" message as requested, with additional context and navigation options.
 */
export const UnauthorizedPage: React.FC = () => {
  const { account, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const userRole = extractRoleName(account?.role_name);
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 h-16 w-16 flex items-center justify-center rounded-full bg-red-100">
            <svg 
              className="h-8 w-8 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            WHO ARE YOU
          </CardTitle>
          <CardDescription className="text-gray-600">
            You don't have permission to access this resource
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-4">
          {isAuthenticated && account ? (
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium">Current user:</span> {account.name}
              </p>
              <p>
                <span className="font-medium">Role:</span> {userRole}
              </p>
              <p className="text-xs mt-3 text-gray-500">
                Contact your administrator if you believe you should have access to this page.
              </p>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              <p>You need to log in to access this resource.</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col gap-2">
          <Button 
            onClick={handleGoHome}
            className="w-full"
            variant="default"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
          </Button>
          
          <Button 
            onClick={handleGoBack}
            className="w-full"
            variant="outline"
          >
            Go Back
          </Button>
          
          {isAuthenticated && (
            <Button 
              onClick={logout}
              className="w-full mt-2"
              variant="ghost"
              size="sm"
            >
              Logout
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default UnauthorizedPage;