'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation } from '@apollo/client'
import { format } from 'date-fns'
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { Dialog } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/use-toast'

enum WarningLevel {
  NOTICE = 'notice',
  WARNING = 'warning',
  SEVERE = 'severe',
  CRITICAL = 'critical'
}

enum WarningStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  EXPIRED = 'expired'
}

interface Warning {
  id: string
  level: WarningLevel
  status: WarningStatus
  reason: string
  details?: string
  expiresAt?: string
  createdAt: string
  strikes: number
  user: {
    id: string
    username: string
  }
  issuedBy: {
    id: string
    username: string
  }
}

export function WarningSystem() {
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [isCreateWarningOpen, setIsCreateWarningOpen] = useState(false)
  const { toast } = useToast()

  const { data: warningsData, loading: loadingWarnings } = useQuery(GET_WARNINGS)
  const { data: userData, loading: loadingUsers } = useQuery(GET_USERS)

  const [createWarning] = useMutation(CREATE_WARNING, {
    onCompleted: () => {
      setIsCreateWarningOpen(false)
      toast({
        title: 'Warning Created',
        description: 'The warning has been issued successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const [resolveWarning] = useMutation(RESOLVE_WARNING, {
    onCompleted: () => {
      toast({
        title: 'Warning Resolved',
        description: 'The warning has been resolved successfully.',
      })
    },
  })

  const getLevelColor = (level: WarningLevel) => {
    switch (level) {
      case WarningLevel.NOTICE:
        return 'bg-blue-500'
      case WarningLevel.WARNING:
        return 'bg-yellow-500'
      case WarningLevel.SEVERE:
        return 'bg-orange-500'
      case WarningLevel.CRITICAL:
        return 'bg-red-500'
      default:
        return 'bg-secondary-500'
    }
  }

  const getStatusColor = (status: WarningStatus) => {
    switch (status) {
      case WarningStatus.ACTIVE:
        return 'text-red-500'
      case WarningStatus.ACKNOWLEDGED:
        return 'text-yellow-500'
      case WarningStatus.RESOLVED:
        return 'text-green-500'
      case WarningStatus.EXPIRED:
        return 'text-secondary-500'
      default:
        return 'text-secondary-500'
    }
  }

  if (loadingWarnings || loadingUsers) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
          Warning System
        </h2>
        <Button onClick={() => setIsCreateWarningOpen(true)}>Issue Warning</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary-500" />
            <h3 className="font-medium">Active Warnings</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">
            {warningsData?.warnings.filter((w: Warning) => w.status === WarningStatus.ACTIVE).length}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <h3 className="font-medium">Critical Warnings</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">
            {warningsData?.warnings.filter((w: Warning) => w.level === WarningLevel.CRITICAL).length}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h3 className="font-medium">Resolved Warnings</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">
            {warningsData?.warnings.filter((w: Warning) => w.status === WarningStatus.RESOLVED).length}
          </p>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium">Recent Warnings</h3>
            <Select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-48"
            >
              <option value="">All Users</option>
              {userData?.users.map((user: any) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {warningsData?.warnings
                .filter((warning: Warning) =>
                  selectedUser ? warning.user.id === selectedUser : true
                )
                .map((warning: Warning) => (
                  <motion.div
                    key={warning.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="rounded-lg border border-secondary-200 p-4 dark:border-secondary-700"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className={getLevelColor(warning.level)}>
                            {warning.level}
                          </Badge>
                          <span className={`text-sm ${getStatusColor(warning.status)}`}>
                            {warning.status}
                          </span>
                        </div>
                        <p className="mt-2 font-medium text-secondary-900 dark:text-white">
                          {warning.reason}
                        </p>
                        {warning.details && (
                          <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                            {warning.details}
                          </p>
                        )}
                        <div className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
                          <p>Issued to: {warning.user.username}</p>
                          <p>By: {warning.issuedBy.username}</p>
                          <p>
                            On: {format(new Date(warning.createdAt), 'PPp')}
                          </p>
                          {warning.expiresAt && (
                            <p>
                              Expires: {format(new Date(warning.expiresAt), 'PPp')}
                            </p>
                          )}
                        </div>
                      </div>
                      {warning.status === WarningStatus.ACTIVE && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            resolveWarning({
                              variables: { id: warning.id },
                            })
                          }
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </div>
      </Card>

      <Dialog
        open={isCreateWarningOpen}
        onClose={() => setIsCreateWarningOpen(false)}
        title="Issue Warning"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            createWarning({
              variables: {
                input: {
                  userId: formData.get('userId'),
                  level: formData.get('level'),
                  reason: formData.get('reason'),
                  details: formData.get('details'),
                  expiresAt: formData.get('expiresAt'),
                },
              },
            })
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium">User</label>
            <Select name="userId" required className="mt-1">
              <option value="">Select a user</option>
              {userData?.users.map((user: any) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium">Warning Level</label>
            <Select name="level" required className="mt-1">
              {Object.values(WarningLevel).map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium">Reason</label>
            <Input name="reason" required className="mt-1" />
          </div>

          <div>
            <label className="block text-sm font-medium">Details</label>
            <Textarea name="details" className="mt-1" />
          </div>

          <div>
            <label className="block text-sm font-medium">Expires At</label>
            <Input name="expiresAt" type="datetime-local" className="mt-1" />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateWarningOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Issue Warning</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
} 