import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireRole?: 'customer' | 'ops';
}

export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
    const { user, userRole, loading } = useAuth();
    const navigate = useNavigate();

    // ✅ Delay navigation until after render phase using microtask
    useEffect(() => {
        if (loading) return;

        // schedule navigation outside the render phase
        queueMicrotask(() => {
            if (!user) {
                navigate('/auth', { replace: true });
            } else if (requireRole && userRole !== requireRole) {
                navigate('/dashboard', { replace: true });
            }
        });
    }, [user, userRole, loading, navigate, requireRole]);

    // ✅ Keep render phase pure
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // If user not ready yet or wrong role, return nothing (navigation will soon happen)
    if (!user || (requireRole && userRole !== requireRole)) {
        return null;
    }

    return <>{children}</>;
}
