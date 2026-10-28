import { useLocation } from 'react-router-dom';
import { platform } from '@/api/platformClient';
import { useQuery } from '@tanstack/react-query';


export default function PageNotFound({}) {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await platform.auth.me();
                return { user, isAuthenticated: true };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });
    
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-obsidian">
            <div className="max-w-md w-full">
                <div className="text-center space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-7xl font-heading font-light text-white/20">404</h1>
                        <div className="h-0.5 w-16 bg-copper mx-auto"></div>
                    </div>
                    
                    <div className="space-y-3">
                        <h2 className="text-2xl font-heading font-medium text-white">
                            Page Not Found
                        </h2>
                        <p className="text-white/50 leading-relaxed font-body">
                            The page <span className="font-medium text-white/70">"{pageName}"</span> could not be found.
                        </p>
                    </div>
                    
                    {isFetched && authData.isAuthenticated && authData.user?.role === 'admin' && (
                        <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-copper/20 flex items-center justify-center mt-0.5">
                                    <div className="w-2 h-2 rounded-full bg-copper"></div>
                                </div>
                                <div className="text-left space-y-1">
                                    <p className="text-sm font-medium text-white/80">Admin Note</p>
                                    <p className="text-sm text-white/50 leading-relaxed">
                                        This page hasn't been implemented yet.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="pt-6">
                        <button 
                            onClick={() => window.location.href = '/'} 
                            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-copper rounded-full hover:bg-copper/90 transition-colors"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}