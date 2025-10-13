import { Link, useLocation } from 'react-router-dom';
import { BarChart3, BookOpen, Users, TrendingUp, LineChart, UserCircle, FileText, Target, Map, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Cursos', href: '/cursos', icon: BookOpen },
  { name: 'Professores', href: '/professores', icon: Users },
  { name: 'Performance', href: '/performance', icon: TrendingUp },
  { name: 'Análises', href: '/analises', icon: LineChart },
  { name: 'CRM', href: '/crm', icon: UserCircle },
  { name: 'Relatórios', href: '/relatorios', icon: FileText },
  { name: 'Gestão de Metas', href: '/gestao-metas', icon: Target },
  { name: 'Mapa de Cursos', href: '/mapa-cursos', icon: Map },
];

export function Navbar() {
  const location = useLocation();
  const { user, userRole, signOut } = useAuth();

  const getRoleLabel = () => {
    switch (userRole) {
      case 'admin':
        return 'Administrador';
      case 'vendedora':
        return 'Vendedora';
      case 'gerente':
        return 'Gerente';
      default:
        return 'Usuário';
    }
  };

  return (
    <nav className="bg-gradient-primary shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-white font-bold text-2xl">CGP</div>
              <div className="hidden sm:block text-white/90 text-sm">Gestão Comercial</div>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${isActive 
                        ? 'bg-white/20 text-white shadow-md' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {getRoleLabel()}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
