import { useState } from 'react';
import { useProfessores, Professor } from '@/hooks/useProfessores';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Mail, Phone, Globe, Linkedin, Instagram } from 'lucide-react';
import { toast } from 'sonner';

export default function Professores() {
  const { professores, isLoading, addProfessor, updateProfessor, deleteProfessor } = useProfessores();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
  const [formData, setFormData] = useState<{
    nome: string;
    email: string;
    telefone: string;
    bio: string;
    foto: string;
    areas: string[];
    redes_sociais: any;
  }>({
    nome: '',
    email: '',
    telefone: '',
    bio: '',
    foto: '',
    areas: [],
    redes_sociais: {}
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProfessor) {
        await updateProfessor({ id: editingProfessor.id, ...formData });
      } else {
        await addProfessor(formData);
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar professor:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      bio: '',
      foto: '',
      areas: [],
      redes_sociais: { linkedin: '', instagram: '', site: '' }
    });
    setEditingProfessor(null);
  };

  const handleEdit = (professor: Professor) => {
    setEditingProfessor(professor);
    setFormData({
      nome: professor.nome,
      email: professor.email,
      telefone: professor.telefone || '',
      bio: professor.bio || '',
      foto: professor.foto || '',
      areas: professor.areas || [],
      redes_sociais: professor.redes_sociais || { linkedin: '', instagram: '', site: '' }
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProfessor(id);
    } catch (error) {
      console.error('Erro ao excluir professor:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Carregando professores...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Professores</h1>
            <p className="text-muted-foreground">Gerencie o corpo docente</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Professor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProfessor ? 'Editar' : 'Novo'} Professor</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="foto">Foto (URL)</Label>
                    <Input
                      id="foto"
                      value={formData.foto}
                      onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="areas">Áreas (separadas por vírgula)</Label>
                  <Input
                    id="areas"
                    placeholder="Licitações, Contratos, RH"
                    value={formData.areas.join(', ')}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      areas: e.target.value.split(',').map(a => a.trim()).filter(Boolean) 
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Redes Sociais</Label>
                  <div className="grid grid-cols-1 gap-2">
                    <Input
                      placeholder="LinkedIn"
                      value={formData.redes_sociais.linkedin || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        redes_sociais: { ...formData.redes_sociais, linkedin: e.target.value } 
                      })}
                    />
                    <Input
                      placeholder="Instagram"
                      value={formData.redes_sociais.instagram || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        redes_sociais: { ...formData.redes_sociais, instagram: e.target.value } 
                      })}
                    />
                    <Input
                      placeholder="Site"
                      value={formData.redes_sociais.site || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        redes_sociais: { ...formData.redes_sociais, site: e.target.value } 
                      })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingProfessor ? 'Salvar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {professores.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-lg text-muted-foreground mb-4">Nenhum professor cadastrado</p>
            <Button onClick={() => setDialogOpen(true)}>Cadastrar Primeiro Professor</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professores.map((professor) => (
              <Card key={professor.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    {professor.foto ? (
                      <img
                        src={professor.foto}
                        alt={professor.nome}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">
                          {professor.nome.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{professor.nome}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {professor.email}
                      </div>
                      {professor.telefone && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {professor.telefone}
                        </div>
                      )}
                    </div>
                  </div>

                  {professor.bio && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                      {professor.bio}
                    </p>
                  )}

                  {professor.areas && professor.areas.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {professor.areas.map((area, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {professor.redes_sociais && (
                    <div className="flex gap-2 mb-4">
                      {professor.redes_sociais.linkedin && (
                        <a href={professor.redes_sociais.linkedin} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Linkedin className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      {professor.redes_sociais.instagram && (
                        <a href={professor.redes_sociais.instagram} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Instagram className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      {professor.redes_sociais.site && (
                        <a href={professor.redes_sociais.site} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Globe className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEdit(professor)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o professor {professor.nome}?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(professor.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
