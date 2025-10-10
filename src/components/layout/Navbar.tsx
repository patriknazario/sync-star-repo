import { Link, useLocation } from 'react-router-dom';
import { BarChart3, BookOpen, Users, TrendingUp, LineChart, UserCircle, FileText, Target } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Cursos', href: '/cursos', icon: BookOpen },
  { name: 'Professores', href: '/professores', icon: Users },
  { name: 'Performance', href: '/performance', icon: TrendingUp },
  { name: 'Análises', href: '/analises', icon: LineChart },
  { name: 'CRM', href: '/crm', icon: UserCircle },
  { name: 'Relatórios', href: '/relatorios', icon: FileText },
  { name: 'Gestão de Metas', href: '/gestao-metas', icon: Target },
];

export function Navbar() {
  const location = useLocation();

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
        </div>
      </div>
    </nav>
  );
}
