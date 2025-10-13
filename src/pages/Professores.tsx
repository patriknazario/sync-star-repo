import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Linkedin, Instagram, Globe, Mail, Phone } from 'lucide-react';
import { Professor } from '@/data/mockData';
import { toast } from 'sonner';

export default function Professores() {
  const { professores, addProfessor, updateProfessor, deleteProfessor } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
  
  const [formData, setFormData] = useState<Partial<Professor>>({
    nome: '',
    email: '',
    telefone: '',
    areas: [],
    redesSociais: {},
    bio: '',
  });

  const [areaInput, setAreaInput] = useState('');

  const handleOpenDialog = (professor?: Professor) => {
    if (professor) {
      setEditingProfessor(professor);
      setFormData(professor);
    } else {
      setEditingProfessor(null);
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        areas: [],
        redesSociais: {},
        bio: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleAddArea = () => {
    if (areaInput.trim()) {
      setFormData({
        ...formData,
        areas: [...(formData.areas || []), areaInput.trim()]
      });
      setAreaInput('');
    }
  };

  const handleRemoveArea = (index: number) => {
    setFormData({
      ...formData,
      areas: formData.areas?.filter((_, i) => i !== index) || []
    });
  };

  const handleSave = () => {
    if (!formData.nome || !formData.email) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (editingProfessor) {
      updateProfessor(editingProfessor.id, formData);
      toast.success('Professor atualizado com sucesso!');
    } else {
      addProfessor(formData as Omit<Professor, 'id'>);
      toast.success('Professor cadastrado com sucesso!');
    }
    
    setIsDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este professor?')) {
      deleteProfessor(id);
      toast.success('Professor excluído com sucesso!');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Professores</h1>
            <p className="text-muted-foreground mt-2">Gerencie o corpo docente da CGP</p>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-accent hover:bg-accent/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Professor
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professores.map((professor) => (
            <Card key={professor.id} className="p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-2">{professor.nome}</h3>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {professor.areas.map((area, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {professor.email && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 mr-2 text-primary" />
                    <span className="truncate">{professor.email}</span>
                  </div>
                )}
                
                {professor.telefone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2 text-primary" />
                    <span>{professor.telefone}</span>
                  </div>
                )}
              </div>

              {professor.bio && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {professor.bio}
                </p>
              )}

              <div className="flex items-center space-x-2 mb-4">
                {professor.redesSociais?.linkedin && (
                  <a
                    href={`https://${professor.redesSociais.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    <Linkedin className="h-4 w-4 text-primary" />
                  </a>
                )}
                {professor.redesSociais?.instagram && (
                  <a
                    href={`https://${professor.redesSociais.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors"
                  >
                    <Instagram className="h-4 w-4 text-accent" />
                  </a>
                )}
                {professor.redesSociais?.site && (
                  <a
                    href={`https://${professor.redesSociais.site}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </a>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => handleOpenDialog(professor)}
                  variant="outline"
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  onClick={() => handleDelete(professor.id)}
                  variant="outline"
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProfessor ? 'Editar Professor' : 'Novo Professor'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label>Áreas de Atuação</Label>
              <div className="flex space-x-2 mb-2">
                <Input
                  value={areaInput}
                  onChange={(e) => setAreaInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddArea()}
                  placeholder="Digite uma área e pressione Enter"
                />
                <Button type="button" onClick={handleAddArea}>Adicionar</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.areas?.map((area, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemoveArea(index)}
                  >
                    {area} ×
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Redes Sociais</Label>
              
              <div>
                <Label htmlFor="linkedin" className="text-xs">LinkedIn</Label>
                <Input
                  id="linkedin"
                  placeholder="linkedin.com/in/usuario"
                  value={formData.redesSociais?.linkedin || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    redesSociais: { ...formData.redesSociais, linkedin: e.target.value }
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="instagram" className="text-xs">Instagram</Label>
                <Input
                  id="instagram"
                  placeholder="@usuario"
                  value={formData.redesSociais?.instagram || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    redesSociais: { ...formData.redesSociais, instagram: e.target.value }
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="site" className="text-xs">Site/Portfólio</Label>
                <Input
                  id="site"
                  placeholder="seusite.com.br"
                  value={formData.redesSociais?.site || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    redesSociais: { ...formData.redesSociais, site: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-accent hover:bg-accent/90">
              {editingProfessor ? 'Salvar Alterações' : 'Cadastrar Professor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
