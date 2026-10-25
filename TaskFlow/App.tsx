import React, { useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';

type Priority = 'Baixa' | 'Média' | 'Alta';
interface Task { id: string; title: string; description: string; priority: Priority; completed: boolean }
const PRIORITIES: Priority[] = ['Baixa', 'Média', 'Alta'];

function TaskForm({ onAdd }: { onAdd: (task: Omit<Task, 'id' | 'completed'>) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Média');
  const [error, setError] = useState('');

  function submit() {
    if (!title.trim() || !description.trim()) { setError('Preencha o título e a descrição para cadastrar.'); return; }
    onAdd({ title: title.trim(), description: description.trim(), priority });
    setTitle(''); setDescription(''); setPriority('Média'); setError('');
  }

  return <View style={s.formCard}>
    <Text style={s.eyebrow}>TIRE DO PAPEL</Text><Text style={s.sectionTitle}>Nova tarefa</Text>
    <Text style={s.label}>Título *</Text>
    <TextInput value={title} onChangeText={setTitle} placeholder="Ex.: Estudar TypeScript" placeholderTextColor="#94A3B8" style={s.input} maxLength={80} />
    <Text style={s.label}>Descrição *</Text>
    <TextInput value={description} onChangeText={setDescription} placeholder="O que precisa ser feito?" placeholderTextColor="#94A3B8" style={[s.input, s.multiline]} multiline textAlignVertical="top" maxLength={300} />
    <Text style={s.label}>Prioridade</Text>
    <View style={s.priorityRow}>{PRIORITIES.map(p => <Pressable key={p} onPress={() => setPriority(p)} style={[s.priorityButton, priority === p && s.prioritySelected]}><Text style={[s.priorityText, priority === p && s.priorityTextSelected]}>{p}</Text></Pressable>)}</View>
    {!!error && <Text style={s.error}>{error}</Text>}
    <Pressable style={s.primaryButton} onPress={submit}><Text style={s.primaryButtonText}>+ Adicionar tarefa</Text></Pressable>
  </View>;
}

function TaskItem({ task, onToggle, onEdit, onDelete }: { task: Task; onToggle: () => void; onEdit: () => void; onDelete: () => void }) {
  const priorityStyle = task.priority === 'Alta' ? s.high : task.priority === 'Baixa' ? s.low : s.medium;
  return <View style={[s.taskCard, task.completed && s.completedCard]}>
    <View style={s.taskTopRow}>
      <Pressable onPress={onToggle} style={[s.checkbox, task.completed && s.checked]} accessibilityRole="checkbox" accessibilityState={{checked: task.completed}}><Text style={s.checkMark}>{task.completed ? '✓' : ''}</Text></Pressable>
      <View style={s.taskMain}><Text style={[s.taskTitle, task.completed && s.taskTitleCompleted]}>{task.title}</Text><Text style={s.taskDescription}>{task.description}</Text></View>
      <View style={[s.badge, priorityStyle]}><Text style={s.badgeText}>{task.priority}</Text></View>
    </View>
    <View style={s.taskBottomRow}><Text style={[s.status, task.completed && s.statusDone]}>{task.completed ? '● Concluída' : '○ Pendente'}</Text>
      <View style={s.actions}><Pressable style={s.editButton} onPress={onEdit}><Text style={s.editText}>Editar</Text></Pressable><Pressable style={s.deleteButton} onPress={onDelete}><Text style={s.deleteText}>Excluir</Text></Pressable></View>
    </View>
  </View>;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('Média');
  const completed = tasks.filter(t => t.completed).length;

  function addTask(data: Omit<Task, 'id' | 'completed'>) {
    setTasks(current => [{ id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, ...data, completed: false }, ...current]);
  }
  function toggleTask(id: string) { setTasks(current => current.map(t => t.id === id ? {...t, completed: !t.completed} : t)); }
  function startEdit(task: Task) { setEditingId(task.id); setEditTitle(task.title); setEditDescription(task.description); setEditPriority(task.priority); }
  function saveEdit() {
    if (!editTitle.trim() || !editDescription.trim()) { Alert.alert('Campos obrigatórios', 'Preencha o título e a descrição.'); return; }
    setTasks(current => current.map(t => t.id === editingId ? {...t, title: editTitle.trim(), description: editDescription.trim(), priority: editPriority} : t));
    setEditingId(null);
  }
  function deleteTask(id: string) {
    Alert.alert('Excluir tarefa', 'Deseja realmente excluir esta tarefa?', [
      {text:'Cancelar', style:'cancel'},
      {text:'Excluir', style:'destructive', onPress: () => { setTasks(current => current.filter(t => t.id !== id)); if (editingId === id) setEditingId(null); }}
    ]);
  }
  function renderTask({item}: {item: Task}) {
    return <View><TaskItem task={item} onToggle={() => toggleTask(item.id)} onEdit={() => startEdit(item)} onDelete={() => deleteTask(item.id)} />
      {editingId === item.id && <View style={s.editCard}><Text style={s.sectionTitle}>Editar tarefa</Text>
        <Text style={s.label}>Título *</Text><TextInput value={editTitle} onChangeText={setEditTitle} style={s.input} placeholder="Título da tarefa" placeholderTextColor="#94A3B8" />
        <Text style={s.label}>Descrição *</Text><TextInput value={editDescription} onChangeText={setEditDescription} style={[s.input,s.multiline]} multiline textAlignVertical="top" placeholder="Descrição da tarefa" placeholderTextColor="#94A3B8" />
        <Text style={s.label}>Prioridade</Text><View style={s.priorityRow}>{PRIORITIES.map(p => <Pressable key={p} onPress={() => setEditPriority(p)} style={[s.priorityButton,editPriority===p && s.prioritySelected]}><Text style={[s.priorityText,editPriority===p && s.priorityTextSelected]}>{p}</Text></Pressable>)}</View>
        <Pressable style={s.primaryButton} onPress={saveEdit}><Text style={s.primaryButtonText}>Salvar alterações</Text></Pressable><Pressable style={s.cancelButton} onPress={() => setEditingId(null)}><Text style={s.cancelText}>Cancelar</Text></Pressable>
      </View>}</View>;
  }

  return <SafeAreaView style={s.safe}><StatusBar barStyle="light-content" backgroundColor="#172554" />
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.header}><Text style={s.appName}>TASKFLOW</Text><Text style={s.heading}>Organize seu dia.</Text><Text style={s.subtitle}>Pequenos passos, grandes resultados.</Text>
        <View style={s.stats}><View style={s.statBox}><Text style={s.statNumber}>{tasks.length}</Text><Text style={s.statLabel}>Tarefas</Text></View><View style={s.divider}/><View style={s.statBox}><Text style={s.statNumber}>{completed}</Text><Text style={s.statLabel}>Concluídas</Text></View><View style={s.divider}/><View style={s.statBox}><Text style={s.statNumber}>{tasks.length-completed}</Text><Text style={s.statLabel}>Pendentes</Text></View></View>
      </View>
      <FlatList style={s.flex} contentContainerStyle={s.list} data={tasks} keyExtractor={item => item.id} renderItem={renderTask} ListHeaderComponent={<TaskForm onAdd={addTask}/>} ListEmptyComponent={<View style={s.empty}><Text style={s.emptyIcon}>✦</Text><Text style={s.emptyTitle}>Tudo começa com uma tarefa</Text><Text style={s.emptyText}>Preencha o formulário acima para adicionar sua primeira tarefa.</Text></View>} ListFooterComponent={<Text style={s.footer}>TASKFLOW · SEUS PLANOS EM MOVIMENTO</Text>} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"/>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  flex:{flex:1}, safe:{flex:1,backgroundColor:'#F4F6FB'},
  header:{backgroundColor:'#172554',paddingHorizontal:22,paddingTop:Platform.OS==='android'?22:12,paddingBottom:23,borderBottomLeftRadius:26,borderBottomRightRadius:26},
  appName:{color:'#A5B4FC',fontSize:11,fontWeight:'900',letterSpacing:3},heading:{color:'#FFF',fontSize:29,fontWeight:'900',marginTop:10},subtitle:{color:'#CBD5E1',fontSize:13,marginTop:5},
  stats:{marginTop:20,backgroundColor:'#253765',borderRadius:15,paddingVertical:13,paddingHorizontal:8,flexDirection:'row',justifyContent:'space-around',alignItems:'center'},
  statBox:{flex:1,alignItems:'center'},statNumber:{color:'#FFF',fontSize:21,fontWeight:'900'},statLabel:{color:'#CBD5E1',fontSize:10,marginTop:3},divider:{height:30,width:1,backgroundColor:'#52628A'},
  list:{padding:16,paddingBottom:30},formCard:{backgroundColor:'#FFF',borderRadius:19,padding:17,marginBottom:20,borderWidth:1,borderColor:'#E7EAF2'},
  eyebrow:{color:'#6366F1',fontSize:10,fontWeight:'900',letterSpacing:1.5},sectionTitle:{color:'#172554',fontSize:20,fontWeight:'900',marginTop:5,marginBottom:12},
  label:{color:'#334155',fontSize:12,fontWeight:'800',marginBottom:6,marginTop:10},input:{backgroundColor:'#F8FAFC',borderWidth:1,borderColor:'#E2E8F0',borderRadius:10,paddingHorizontal:12,paddingVertical:10,color:'#0F172A',fontSize:14},multiline:{minHeight:70},
  priorityRow:{flexDirection:'row',gap:8},priorityButton:{flex:1,borderWidth:1,borderColor:'#E2E8F0',borderRadius:9,paddingVertical:10,alignItems:'center',backgroundColor:'#FFF'},prioritySelected:{backgroundColor:'#EEF2FF',borderColor:'#6366F1'},priorityText:{color:'#64748B',fontSize:12,fontWeight:'700'},priorityTextSelected:{color:'#4338CA'},
  error:{color:'#DC2626',fontSize:12,marginTop:9},primaryButton:{marginTop:16,backgroundColor:'#4F46E5',borderRadius:11,alignItems:'center',paddingVertical:13},primaryButtonText:{color:'#FFF',fontWeight:'900',fontSize:13},
  taskCard:{backgroundColor:'#FFF',borderRadius:15,borderWidth:1,borderColor:'#E7EAF2',padding:14,marginBottom:11},completedCard:{backgroundColor:'#FAFBFE'},taskTopRow:{flexDirection:'row',alignItems:'flex-start',gap:9},
  checkbox:{width:23,height:23,borderRadius:7,borderWidth:1.5,borderColor:'#CBD5E1',alignItems:'center',justifyContent:'center',marginTop:1},checked:{backgroundColor:'#10B981',borderColor:'#10B981'},checkMark:{color:'#FFF',fontSize:14,fontWeight:'900'},
  taskMain:{flex:1},taskTitle:{color:'#1E293B',fontSize:14,fontWeight:'900',lineHeight:19},taskTitleCompleted:{color:'#94A3B8',textDecorationLine:'line-through'},taskDescription:{color:'#64748B',fontSize:12,lineHeight:18,marginTop:5},
  badge:{borderRadius:7,paddingHorizontal:7,paddingVertical:5},high:{backgroundColor:'#FEE2E2'},medium:{backgroundColor:'#FEF3C7'},low:{backgroundColor:'#D1FAE5'},badgeText:{color:'#334155',fontSize:10,fontWeight:'900'},
  taskBottomRow:{borderTopWidth:1,borderTopColor:'#F1F5F9',marginTop:12,paddingTop:10,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:6},status:{color:'#64748B',fontSize:10,fontWeight:'800'},statusDone:{color:'#059669'},
  actions:{flexDirection:'row',gap:6},editButton:{paddingHorizontal:10,paddingVertical:7,borderRadius:7,backgroundColor:'#EEF2FF'},editText:{color:'#4338CA',fontSize:10,fontWeight:'900'},deleteButton:{paddingHorizontal:10,paddingVertical:7,borderRadius:7,backgroundColor:'#FEF2F2'},deleteText:{color:'#B91C1C',fontSize:10,fontWeight:'900'},
  editCard:{backgroundColor:'#FFF',borderRadius:15,padding:15,marginTop:-3,marginBottom:14,borderWidth:1,borderColor:'#C7D2FE'},cancelButton:{paddingVertical:12,alignItems:'center'},cancelText:{color:'#64748B',fontSize:12,fontWeight:'800'},
  empty:{alignItems:'center',paddingHorizontal:20,paddingVertical:26},emptyIcon:{color:'#818CF8',fontSize:30,marginBottom:7},emptyTitle:{color:'#1E293B',fontSize:15,fontWeight:'900',textAlign:'center'},emptyText:{color:'#64748B',fontSize:12,textAlign:'center',marginTop:7,lineHeight:18},
  footer:{color:'#94A3B8',fontSize:9,letterSpacing:1.1,textAlign:'center',marginTop:22}
});
