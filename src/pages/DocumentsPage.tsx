import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Calendar, 
  Filter,
  Search,
  Plus,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface Document {
  id: string;
  name: string;
  type: 'prescription' | 'report' | 'image' | 'other';
  uploadDate: Date;
  size: string;
  doctor: string;
  patient: string;
  category: string;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Blood Test Results - March 2024.pdf',
    type: 'report',
    uploadDate: new Date('2024-03-15'),
    size: '2.4 MB',
    doctor: 'Dr. Sarah Wilson',
    patient: 'John Smith',
    category: 'Lab Results'
  },
  {
    id: '2',
    name: 'Prescription - Antibiotics.pdf',
    type: 'prescription',
    uploadDate: new Date('2024-03-10'),
    size: '156 KB',
    doctor: 'Dr. Michael Brown',
    patient: 'Emily Johnson',
    category: 'Medications'
  },
  {
    id: '3',
    name: 'X-Ray Chest - Right Lung.jpg',
    type: 'image',
    uploadDate: new Date('2024-03-08'),
    size: '3.8 MB',
    doctor: 'Dr. Lisa Anderson',
    patient: 'Robert Davis',
    category: 'Imaging'
  },
  {
    id: '4',
    name: 'Cardiology Consultation.pdf',
    type: 'report',
    uploadDate: new Date('2024-03-05'),
    size: '1.2 MB',
    doctor: 'Dr. James Wilson',
    patient: 'Maria Garcia',
    category: 'Consultations'
  },
  {
    id: '5',
    name: 'Vaccination Record.pdf',
    type: 'other',
    uploadDate: new Date('2024-02-28'),
    size: '890 KB',
    doctor: 'Dr. Anna Martinez',
    patient: 'David Johnson',
    category: 'Immunizations'
  }
];

const DocumentsPage = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'prescription':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'report':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'image':
        return <FileText className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'prescription':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'report':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'image':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const filteredDocuments = mockDocuments
    .filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || doc.type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'size':
          return parseFloat(a.size) - parseFloat(b.size);
        default: // date
          return b.uploadDate.getTime() - a.uploadDate.getTime();
      }
    });

  const documentsByType = {
    prescription: mockDocuments.filter(doc => doc.type === 'prescription').length,
    report: mockDocuments.filter(doc => doc.type === 'report').length,
    image: mockDocuments.filter(doc => doc.type === 'image').length,
    other: mockDocuments.filter(doc => doc.type === 'other').length,
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('documents')}</h1>
          <p className="text-muted-foreground mt-1">
            Upload, organize, and manage your medical documents
          </p>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{documentsByType.prescription}</p>
                <p className="text-xs text-muted-foreground">Prescriptions</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{documentsByType.report}</p>
                <p className="text-xs text-muted-foreground">Reports</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{documentsByType.image}</p>
                <p className="text-xs text-muted-foreground">Images</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{mockDocuments.length}</p>
                <p className="text-xs text-muted-foreground">Total Documents</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents, doctors, or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="prescription">Prescriptions</SelectItem>
                <SelectItem value="report">Reports</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="type">Sort by Type</SelectItem>
                <SelectItem value="size">Sort by Size</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDocuments.map((document, index) => (
              <div key={document.id}>
                <div className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    {getDocumentIcon(document.type)}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {document.name}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>by {document.doctor}</span>
                        <span>•</span>
                        <span>{document.uploadDate.toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{document.size}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getTypeColor(document.type)} variant="secondary">
                          {document.type}
                        </Badge>
                        <Badge variant="outline">
                          {document.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {index < filteredDocuments.length - 1 && <Separator />}
              </div>
            ))}
            
            {filteredDocuments.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No documents found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm ? 'Try adjusting your search or filters' : 'Upload your first document to get started'}
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsPage;