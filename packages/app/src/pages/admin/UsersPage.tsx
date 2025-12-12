import { useCallback, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Ban,
  CheckCircle,
  Shield,
  User as UserIcon,
  UserPlus,
} from 'lucide-react'

import { admin, signIn } from '@/lib/auth-client'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

interface AdminUser {
  id: string
  name: string
  email: string
  role?: string
  banned?: boolean | null
  banReason?: string | null
  createdAt: Date
}

export function UsersPage() {
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuth()
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [banDialogUser, setBanDialogUser] = useState<AdminUser | null>(null)
  const [banReason, setBanReason] = useState('')

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const response = await admin.listUsers({
        query: {
          limit: 100,
        },
      })
      return response.data
    },
  })

  const users = usersData?.users ?? []

  // Invite user mutation
  const inviteMutation = useMutation({
    mutationFn: async ({ name, email }: { name: string; email: string }) => {
      // Create user via admin plugin
      await admin.createUser({
        email,
        name,
        role: 'user' as const,
        password: crypto.randomUUID(), // Temporary password, won't be used
      })

      // Send magic link to the new user
      await signIn.magicLink({
        email,
        callbackURL: `${import.meta.env.VITE_APP_URL}/search`,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      setInviteName('')
      setInviteEmail('')
      setInviteDialogOpen(false)
    },
  })

  // Ban user mutation
  const banMutation = useMutation({
    mutationFn: async ({
      userId,
      reason,
    }: {
      userId: string
      reason?: string
    }) => {
      await admin.banUser({
        userId,
        banReason: reason,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      setBanDialogUser(null)
      setBanReason('')
    },
  })

  // Unban user mutation
  const unbanMutation = useMutation({
    mutationFn: async (userId: string) => {
      await admin.unbanUser({ userId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })

  // Set role mutation
  const setRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string
      role: 'user' | 'admin'
    }) => {
      await admin.setRole({ userId, role })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })

  const handleInvite = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (inviteName && inviteEmail) {
        inviteMutation.mutate({ name: inviteName, email: inviteEmail })
      }
    },
    [inviteName, inviteEmail, inviteMutation],
  )

  const handleBan = useCallback(() => {
    if (banDialogUser) {
      banMutation.mutate({
        userId: banDialogUser.id,
        reason: banReason || undefined,
      })
    }
  }, [banDialogUser, banReason, banMutation])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground">
            Invitez, gérez et administrez les utilisateurs de la plateforme.
          </p>
        </div>

        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Inviter un utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Inviter un utilisateur</DialogTitle>
              <DialogDescription>
                Envoyez une invitation par email à un nouvel utilisateur.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInvite}>
              <div className="py-4 space-y-4">
                <Input
                  type="text"
                  placeholder="Nom complet"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="email@exemple.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setInviteDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={inviteMutation.isPending}>
                  {inviteMutation.isPending
                    ? 'Envoi...'
                    : "Envoyer l'invitation"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  Aucun utilisateur trouvé
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: AdminUser) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === 'admin' ? 'default' : 'secondary'}
                    >
                      {user.role === 'admin' ? (
                        <>
                          <Shield className="mr-1 h-3 w-3" />
                          Admin
                        </>
                      ) : (
                        <>
                          <UserIcon className="mr-1 h-3 w-3" />
                          Utilisateur
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.banned ? (
                      <Badge variant="destructive">
                        <Ban className="mr-1 h-3 w-3" />
                        Banni
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-600"
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Actif
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Toggle role button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setRoleMutation.mutate({
                            userId: user.id,
                            role: user.role === 'admin' ? 'user' : 'admin',
                          })
                        }
                        disabled={
                          setRoleMutation.isPending ||
                          user.id === currentUser?.id
                        }
                      >
                        {user.role === 'admin' ? 'Rétrograder' : 'Promouvoir'}
                      </Button>

                      {/* Ban/Unban button */}
                      {user.banned ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => unbanMutation.mutate(user.id)}
                          disabled={unbanMutation.isPending}
                        >
                          Débannir
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setBanDialogUser(user)}
                          disabled={user.id === currentUser?.id}
                        >
                          Bannir
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Ban Dialog */}
      <Dialog
        open={!!banDialogUser}
        onOpenChange={(open) => !open && setBanDialogUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bannir l'utilisateur</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir bannir {banDialogUser?.name} (
              {banDialogUser?.email}) ?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Raison du bannissement (optionnel)"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogUser(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleBan}
              disabled={banMutation.isPending}
            >
              {banMutation.isPending
                ? 'Bannissement...'
                : 'Confirmer le bannissement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
