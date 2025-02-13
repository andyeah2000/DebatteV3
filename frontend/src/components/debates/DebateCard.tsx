import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

return (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ duration: 0.2 }}
  >
    <Card 
      className="group hover:border-primary/20 hover:shadow-lg transition-all duration-200"
    >
    </Card>
  </motion.div>
) 